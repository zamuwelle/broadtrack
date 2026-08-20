@include('emails.partials.font')
<div style="max-width: 560px; margin: 0 auto; padding: 32px 24px; background-color: #f8fafc; font-family: 'Poppins', 'Roboto', 'Segoe UI', Arial, sans-serif;">
	<div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 32px;">
		@include('emails.partials.header')
		<div style="font-size: 14px; font-weight: 600; color: #64748b; margin-bottom: 8px;">Message from {{ $name }}</div>
		<div style="font-size: 16px; line-height: 1.6; color: #1e293b; padding: 16px; background-color: #f8fafc; border-radius: 8px; border-left: 4px solid #0F4C81; margin-bottom: 24px;">
			{!! $body !!}
		</div>
		<div style="background-color: #f8fafc; border-radius: 8px; padding: 16px; font-size: 14px; color: #475569;">
			<div style="margin-bottom: 8px;"><strong style="color: #1e293b;">From:</strong> {{ $name }}</div>
			<div><strong style="color: #1e293b;">Email:</strong> <a href="mailto:{{ $email }}" style="color: #0F4C81; text-decoration: none;">{{ $email }}</a></div>
		</div>
	</div>
</div>