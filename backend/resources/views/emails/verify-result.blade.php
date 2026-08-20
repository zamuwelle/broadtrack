<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>BroadTrack</title>
	@include('emails.partials.font')
</head>
<body style="margin: 0;">
	<div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f8fafc; font-family: 'Poppins', 'Roboto', 'Segoe UI', Arial, sans-serif; padding: 24px; box-sizing: border-box;">
		<div style="max-width: 420px; width: 100%; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 40px 32px; text-align: center;">
			<div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 32px;">
				<img src="https://broadtrack.web.app/logo.png" width="64" height="64" alt="BroadTrack" style="display: block; background-color: #ffffff; border-radius: 8px;" />
				<span style="font-size: 24px; font-weight: 800; color: #0F4C81;">Broad<span style="color: #1F2937;">Track</span></span>
			</div>
			@if ($success)
				<div style="width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; background-color: #22C55E; display: flex; align-items: center; justify-content: center;">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 12 2 2 4-4"/></svg>
				</div>
				<h2 style="font-size: 20px; font-weight: 700; color: #1F2937; margin: 0 0 8px 0;">Email verified!</h2>
				<p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 28px 0;">Your email has been verified. You can now sign in to your account.</p>
			@else
				<div style="width: 56px; height: 56px; margin: 0 auto 20px; border-radius: 50%; background-color: #EF4444; display: flex; align-items: center; justify-content: center;">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
				</div>
				<h2 style="font-size: 20px; font-weight: 700; color: #1F2937; margin: 0 0 8px 0;">Link invalid or expired</h2>
				<p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 28px 0;">This verification link is invalid or has already been used.</p>
			@endif
			<a href="{{ $frontendUrl }}" style="display: inline-block; background-color: #0F4C81; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 32px; border-radius: 8px;">Sign in</a>
		</div>
	</div>
</body>
</html>