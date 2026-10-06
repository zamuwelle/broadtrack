@include('emails.partials.layout-start')
		<h2 style="font-size:20px; line-height:1.3; color:{{ config('theme.text') }}; margin:0 0 20px;">Feedback</h2>
		<div style="font-size:14px; line-height:1.6; color:#475569; margin-bottom:24px;">
			<div><strong style="color:#1e293b;">From:</strong> {{ $name }}</div>
			<div><strong style="color:#1e293b;">Email:</strong> <a href="mailto:{{ $email }}" style="color:{{ config('theme.primary') }}; overflow-wrap:anywhere;">{{ $email }}</a></div>
		</div>
		<div style="font-size:14px; font-weight:700; color:#1e293b; margin-bottom:8px;">Message</div>
		<div style="font-size:15px; line-height:1.6; color:#475569; overflow-wrap:anywhere;">{!! $body !!}</div>
@include('emails.partials.layout-end')
