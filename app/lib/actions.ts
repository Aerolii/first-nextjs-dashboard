'use server';

import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
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

export default async function createInvoice(formData: FormData) {
  // const rawFormData = {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };
  // const rawFormData = Object.fromEntries(formData.entries());
  // console.log(rawFormData);

  const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
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
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });
export const updateInvoice = async (id: string, formData: FormData) => {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

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
};

export const deleteVoice = async (id: string) => {
  // 发生错误时，页面仍然在路由页面
  throw Error('Failed to Delete Invoice');
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
