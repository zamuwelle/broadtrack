<?php

namespace App\Http\Controllers;

use App\Mail\ContactMail;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
	public function send()
	{
		$validated = request()->validate([
			'firstname' => 'required|string|max:255',
			'lastname' => 'required|string|max:255',
			'email' => 'required|email',
			'message' => 'required|string',
		]);

		$recipients = config('contact.recipients', []);

		if (!empty($recipients)) {
			try {
				Mail::to($recipients[0])->queue(new ContactMail(
					$validated['firstname'],
					$validated['lastname'],
					$validated['email'],
					$validated['message'],
					$recipients,
				));
			} catch (\Throwable) {}
		}

		return $this->success(null, 'Message sent successfully');
	}
}
