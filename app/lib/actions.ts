'use server';

import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

const refreshInvoicePath = () => {
  const pathname = '/dashboard/invoices';

  // 数据库更新后，/dashboard/invoices路径将重新验证，并且将从服务器获取新数据。
  revalidatePath(pathname);

  // 将用户重定向回该/dashboard/invoices页面
  redirect(pathname);
};

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export default async function createInvoice(
  prevState: State,
  formData: FormData,
) {
  console.log('prevState :>> ', prevState);
  // const rawFormData = {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };
  // const rawFormData = Object.fromEntries(formData.entries());
  // console.log(rawFormData);
  // Validate form fields using Zod
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  // const { customerId, amount, status } = CreateInvoice.parse({
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // });
  // If form validation fails, return errors early. Otherwise, continue.
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Prepare data for insertion into the database
  const { customerId, amount, status } = validatedFields.data;
  const amountInCent = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  try {
    await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCent}, ${status}, ${date})
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Create Invoice.',
    };
  }

  // const pathname = '/dashboard/invoices';

  // // 数据库更新后，/dashboard/invoices路径将重新验证，并且将从服务器获取新数据。
  // revalidatePath(pathname);

  // // 将用户重定向回该/dashboard/invoices页面
  // redirect(pathname);

  refreshInvoicePath();
  return {};
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export const updateInvoice = async (
  id: string,
  prevState: State,
  formData: FormData,
) => {
  // const { customerId, amount, status } = UpdateInvoice.parse({
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // });
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;

  const amountInCent = amount * 100;

  try {
    await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCent}, status = ${status}
    WHERE id = ${id}
  `;
  } catch (error) {
    return {
      message: 'Database Error: Failed to Update Invoice.',
    };
  }
  // revalidatePath('/dashboard/invoices');
  // redirect('/dashboard/invoices');
  // 这里执行了跳转，因此不需要返回成功信息
  refreshInvoicePath();
  return {};
};

export const deleteVoice = async (id: string) => {
  // 发生错误时，页面仍然在路由页面
  try {
    await sql`
    DELETE FROM invoices WHERE id = ${id}
  `;
    return {
      message: 'Deleted Invoice.',
    };
  } catch (error) {
    return {
      message: 'Database Error: Failed to Delete Invoice.',
    };
  }
  // 重新获取数据
  revalidatePath('/dashboard/invoices');
};

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    const user = await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}
