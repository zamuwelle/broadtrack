@include('emails.partials.font')
<div style="max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; font-family: 'Poppins', 'Roboto', 'Segoe UI', Arial, sans-serif;">
	<div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px;">
		@include('emails.partials.header')
		<h2 style="font-size: 20px; font-weight: 700; color: #1F2937; margin: 0 0 16px 0;">Reset Your Password</h2>
		<p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
			Hi {{ $firstname }}, we received a request to reset your password for your BroadTrack account. Click the button below to set a new password:
		</p>
		<div style="text-align: center; margin-bottom: 24px;">
			<a href="{{ $resetUrl }}" style="display: inline-block; background-color: #0F4C81; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 32px; border-radius: 8px;">
				Reset Password
			</a>
		</div>
		<p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0 0 16px 0;">
			This link will expire in 15 minutes. If you did not request a password reset, you can safely ignore this email.
		</p>
		<div style="border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #94a3b8; word-break: break-all;">
			If the button doesn't work, copy and paste this link into your browser:<br />
			<a href="{{ $resetUrl }}" style="color: #0F4C81; text-decoration: underline;">{{ $resetUrl }}</a>
		</div>
	</div>
</div>