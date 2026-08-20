<?php

namespace App\Http\Controllers;

use App\Http\Requests\Api\V1\ContactRequest;
use App\Mail\ContactMail;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(ContactRequest $request)
    {
        $validated = $request->validated();

        $recipients = config('contact.recipients', []);

        if (! empty($recipients)) {
            try {
                Mail::to($recipients[0])->queue(new ContactMail(
                    $validated['firstname'],
                    $validated['lastname'],
                    $validated['email'],
                    $validated['message'],
                    $recipients,
                ));
            } catch (\Throwable) {
            }
        }

        return $this->success(null, 'Message sent successfully');
    }
}
