@include('emails.partials.font')
<div style="max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; font-family: 'Poppins', 'Roboto', 'Segoe UI', Arial, sans-serif;">
	<div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px;">
		@include('emails.partials.header')
		<h2 style="font-size: 20px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Verify Your Email</h2>
		<p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
			Hi {{ $firstname }}, welcome to BroadTrack! Use the 6-digit verification code below to verify your email address and activate your account:
		</p>
		<div style="text-align: center; margin: 28px 0;">
			<div style="display: inline-block; background-color: #f1f5f9; border: 1.5px dashed #cbd5e1; border-radius: 8px; padding: 14px 28px;">
				<span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #075985;">{{ $code }}</span>
			</div>
		</div>
		<p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 16px 0;">
			This code will expire in 15 minutes. Enter this code in the verification dialog to complete your setup. If you did not create a BroadTrack account, you can safely ignore this email.
		</p>
	</div>
</div>