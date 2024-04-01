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
  await sql`
  INSERT INTO invoices (customer_id, amount, status, date)
  VALUES (${customerId}, ${amountInCent}, ${status}, ${date})
  `;

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

  await sql`
    UPDATE invoices
    SET customer_id = ${customerId}, amount = ${amountInCent}, status = ${status}
    WHERE id = ${id}
  `;
  // revalidatePath('/dashboard/invoices');
  // redirect('/dashboard/invoices');
  refreshInvoicePath();
};

export const deleteVoice = async (id: string) => {
  await sql`
    DELETE FROM invoices WHERE id = ${id}
  `;
  // 重新获取数据
  revalidatePath('/dashboard/invoices');
};
