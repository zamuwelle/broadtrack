@include('emails.partials.layout-start')
		<h2 style="font-size: 20px; font-weight: 700; color: {{ config('theme.text') }}; margin: 0 0 16px 0;">Reset Your Password</h2>
		<p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
			Hi {{ $firstname }},<br><br>We received a request to reset your BroadTrack password. Use the button below to choose a new password. The link expires in 15 minutes.
		</p>
		<p style="font-size:15px; line-height:1.6; color:#475569; margin:0 0 24px;">
			If you didn't request this, you can ignore this email. Your password will stay the same.
		</p>
		<div style="text-align: center; margin-bottom: 24px;">
			<a href="{{ $resetUrl }}" style="display: inline-block; background-color: {{ config('theme.primary') }}; color: {{ config('theme.surface') }}; text-decoration: none; font-size: 16px; font-weight: 600; padding: 16px 32px; border-radius: 8px;">
				Reset Password
			</a>
		</div>
@include('emails.partials.layout-end')
