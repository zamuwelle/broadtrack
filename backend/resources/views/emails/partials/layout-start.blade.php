@include('emails.partials.font')
<div style="max-width:560px; margin:0 auto; padding:32px 20px; background:{{ config('theme.surface') }}; font-family:{{ config('theme.font_body') }};">
    <div style="background:{{ config('theme.surface') }}; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
        @include('emails.partials.header')
        <div style="padding:28px;">
