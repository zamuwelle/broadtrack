<?php

return [
    'recipients' => env('CONTACT_EMAILS') ? explode(',', env('CONTACT_EMAILS')) : [],
];
