<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EquipmentReturnReminderMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        public $ticketId,
        public $firstname,
        public $dueDate,
        public $equipments,
        public $reminderType = 'near_deadline',
        public $daysOverdue = 0,
        public $startDate = null
    ) {}

    public function envelope()
    {
        $subject = $this->reminderType === 'near_deadline'
            ? "Equipment Return Reminder: Slip #{$this->ticketId}"
            : "Notice of Overdue Equipment: Slip #{$this->ticketId}";

        return new Envelope(subject: $subject);
    }

    public function content()
    {
        $viewName = $this->reminderType === 'near_deadline'
            ? 'emails.near-deadline-reminder'
            : 'emails.late-deadline-reminder';

        return new Content(
            view: $viewName,
            with: [
                'ticketId' => $this->ticketId,
                'firstname' => $this->firstname,
                'dueDate' => $this->dueDate,
                'equipments' => $this->equipments,
                'daysOverdue' => $this->daysOverdue,
                'startDate' => $this->startDate,
            ],
        );
    }
}
