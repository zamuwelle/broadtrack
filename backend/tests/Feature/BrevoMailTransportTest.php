<?php

use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpClient\MockHttpClient;
use Symfony\Component\HttpClient\Response\MockResponse;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoApiTransport;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoTransportFactory;
use Symfony\Component\Mailer\Transport\Dsn;
use Symfony\Component\Mime\Email;

test('configured default mailer resolves to the Brevo API transport', function (): void {
    config([
        'mail.default' => 'brevo',
        'services.brevo.key' => 'test-api-key',
    ]);

    expect(Mail::mailer()->getSymfonyTransport())->toBeInstanceOf(BrevoApiTransport::class);
});

test('Brevo API transport sends transactional email through a mocked HTTP client', function (): void {
    $request = [];
    $httpClient = new MockHttpClient(function (string $method, string $url, array $options) use (&$request): MockResponse {
        $request = compact('method', 'url', 'options');

        return new MockResponse('{"messageId":"test-message-id"}', ['http_code' => 201]);
    });

    $transport = (new BrevoTransportFactory(client: $httpClient))->create(
        new Dsn('brevo+api', 'default', 'test-api-key'),
    );

    $transport->send(
        (new Email)
            ->from('app@example.test')
            ->to('borrower@example.test')
            ->subject('Equipment return reminder')
            ->text('Please return your equipment.'),
    );

    $payload = json_decode($request['options']['body'], true);

    expect($request['method'])->toBe('POST')
        ->and($request['url'])->toBe('https://api.brevo.com/v3/smtp/email')
        ->and($request['options']['normalized_headers']['api-key'][0])->toBe('api-key: test-api-key')
        ->and($payload)->toMatchArray([
            'sender' => ['email' => 'app@example.test'],
            'to' => [['email' => 'borrower@example.test']],
            'subject' => 'Equipment return reminder',
            'textContent' => 'Please return your equipment.',
        ])
        ->and($httpClient->getRequestsCount())->toBe(1);
});
