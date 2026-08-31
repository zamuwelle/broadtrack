<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\Api\V1\ContactRequest;
use App\Mail\ContactMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Mail;

class ContactController extends ApiController
{
    public function send(ContactRequest $request): JsonResponse
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

        return $this->success();
    }
}
