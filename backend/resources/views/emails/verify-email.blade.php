@include('emails.partials.layout-start')
		<h2 style="font-size: 20px; font-weight: 700; color: {{ config('theme.text') }}; margin: 0 0 16px 0;">Verify Your Email</h2>
		<p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
			Hi {{ $firstname }},<br><br>Welcome to BroadTrack! Enter the code below to verify your email address and activate your account. The code expires in 15 minutes.
		</p>
		<p style="font-size:15px; line-height:1.6; color:#475569; margin:0 0 24px;">
			If you didn't create a BroadTrack account, you can ignore this email.
		</p>
		<div style="text-align: center; margin: 28px 0;">
			<div style="display: inline-block; background-color: #f1f5f9; border-radius: 8px; padding: 14px 28px;">
				<span style="font-family: {{ config('theme.font_code') }}; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: {{ config('theme.text') }};">{{ $code }}</span>
			</div>
		</div>
@include('emails.partials.layout-end')
