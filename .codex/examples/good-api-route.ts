// app/api/payments/[id]/submit/route.ts
import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { PaymentService } from '@/services/payment.service';
import { AppError } from '@/types/errors';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerClient();

    // Vérifier auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier billing lock
    if (process.env.CONTRATPRO_REQUIRE_BILLING === 'true') {
      const { data: billing } = await supabase
        .from('billing_subscriptions')
        .select('*')
        .eq('organization_id', user.id)
        .single();

      if (!billing || !['active', 'trialing'].includes(billing.status)) {
        return NextResponse.json(
          { error: 'Billing required', code: 'BILLING_LOCKED' },
          { status: 403 }
        );
      }
    }

    const paymentService = new PaymentService(supabase);
    const result = await paymentService.submitToGoCardless(params.id);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
