<?php

namespace Database\Seeders;

use App\Models\Equipment;
use Illuminate\Database\Seeder;

class EquipmentSeeder extends Seeder
{
    public function run()
    {

        $equipment = [
            ['category' => 'Audio', 'name' => 'Speaker with Amplifier', 'brand' => 'Dai-chi (PR08)', 'quantity' => 1, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565944/broadtrack/30679acc34300bf38d09589d4800e354.webp', 'description' => 'Portable powered speaker with built-in amplifier, ready to play without external gear', 'specs' => ['Type: Active speaker with built-in amplifier', 'Brand: Dai-ichi, Philippine-made since 1972', 'Power: AC mains']],
            ['category' => 'Audio', 'name' => 'Wired Microphone', 'brand' => 'Behringer', 'quantity' => 3, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565940/broadtrack/820d4ac96f19601360c37057fd3bcc9a.webp', 'description' => 'Handheld dynamic microphone for vocals, speeches and presentations', 'specs' => ['Type: Dynamic', 'Polar pattern: Cardioid', 'Connector: XLR']],
            ['category' => 'Audio', 'name' => 'Condenser Microphone', 'brand' => 'Behringer (C3)', 'quantity' => 1, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565938/broadtrack/d3fd092e7beedf2779ae3dc366ec086d.webp', 'description' => 'Dual-diaphragm studio condenser microphone with selectable pickup patterns', 'specs' => ['Capsule: Dual 16mm diaphragm', 'Frequency response: 40Hz - 18kHz', 'Polar patterns: Cardioid, Omni, Figure-8', 'Max SPL: 142dB', 'Self-noise: 23dB', 'Output impedance: 350Ω', 'Power: 48V phantom power', 'Weight: 450g']],
            ['category' => 'Audio', 'name' => 'Wireless Lavalier Microphone', 'brand' => 'IMIX (1CH01HL)', 'quantity' => 2, 'description' => 'Clip-on wireless mic for hands-free speaking during events', 'specs' => ['Type: Wireless lavalier', 'Channels: Single channel (1CH)', 'Includes: Bodypack receiver']],
            ['category' => 'Audio', 'name' => 'Wireless Lavalier Microphone System', 'brand' => 'Hollyland', 'quantity' => 1, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565950/broadtrack/a4e2618fb0659b36b8e1be867987b41a.webp', 'description' => 'Wireless clip-on mic system for hands-free recording', 'specs' => ['Type: Digital wireless lavalier (Hollyland Lark line)', 'Frequency: 2.4GHz digital', 'Range: up to 200m line of sight']],
            ['category' => 'Audio', 'name' => 'Lapel Microphone', 'brand' => null, 'quantity' => 4, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565954/broadtrack/3dfa59797f7e9d0f86408c987b61fbb1.webp', 'description' => 'Clip-on mic for hands-free speech during presentations', 'specs' => ['Type: Clip-on condenser', 'Connector: 3.5mm']],
            ['category' => 'Audio', 'name' => 'Wireless Microphone', 'brand' => 'Titanium Audio', 'quantity' => 1, 'description' => 'UHF wireless handheld mic for hosts and performers on stage', 'specs' => ['Type: Wireless handheld', 'Frequency band: UHF', 'Includes: Receiver']],
            ['category' => 'Audio', 'name' => 'Shotgun Microphone', 'brand' => 'IMIX by TRIDENT', 'quantity' => 1, 'description' => 'Directional shotgun mic that picks up sound from where it points', 'specs' => ['Frequency range: 20Hz - 20kHz', 'Output impedance: 600Ω', 'Max SPL: >100dB', 'Power: 48V phantom power or AA battery']],
            ['category' => 'Audio', 'name' => 'Microphone Stand', 'brand' => 'Trident', 'quantity' => 4, 'description' => 'Floor mic stand with boom arm for hands-free microphone use', 'specs' => ['Type: Tripod base with boom', 'Adjustable height', 'Includes mic clip', 'Material: Heavy-duty steel']],
            ['category' => 'Audio', 'name' => 'Microphone Holder', 'brand' => 'Trident', 'quantity' => 8, 'description' => 'Spare mic clip that grips a microphone onto any stand', 'specs' => ['Type: Mic clip', 'Fits: Standard mic stands']],
            ['category' => 'Audio', 'name' => 'Desk Mic Stand', 'brand' => null, 'quantity' => 2, 'description' => 'Tabletop mic stand for seated speakers and panel talks', 'specs' => ['Type: Tabletop', 'Base: Weighted']],
            ['category' => 'Audio', 'name' => 'Speaker Stand', 'brand' => null, 'quantity' => 1, 'description' => 'Elevates a speaker to ear level for better sound coverage', 'specs' => ['Mount: 35mm standard pole', 'Height: Adjustable']],
            ['category' => 'Audio', 'name' => 'Audio Mixer (8 Channels)', 'brand' => 'Boston (MIX04AU)', 'quantity' => 1, 'description' => 'Compact mixer for blending mics and instruments into one output', 'specs' => ['Channels: 8 (4 mic inputs)', 'Stereo inputs: 2', 'Phantom power: 48V', 'Interface: USB', 'Aux out: 1', 'Size: 220 x 220 x 65mm', 'Weight: 1kg', 'Power: 100 - 264V']],
            ['category' => 'Audio', 'name' => 'Audio Mixer (10 Channels)', 'brand' => 'Phonic (MM1002)', 'quantity' => 1, 'description' => 'Compact mixer for small events with a few mic and stereo sources', 'specs' => ['Inputs: 2 balanced Mic/Line (combo XLR/1/4")', 'Stereo inputs: 4 with +4/-10 selector', '2T return inputs for CD playback', 'Low-cut switch on mic channels', 'Peak LED indicator']],
            ['category' => 'Audio', 'name' => 'Audio Mixer (18 Channels)', 'brand' => 'Visual Sound ECH', 'quantity' => 1, 'description' => 'Large mixer for events needing many mics and line sources at once', 'specs' => ['Channels: 18']],
            ['category' => 'Audio', 'name' => 'Audio Amplifier', 'brand' => 'Konzert', 'quantity' => 1, 'description' => 'Powers passive speakers for venue and event sound', 'specs' => ['Type: Stereo karaoke amplifier (Konzert AV line)', 'Max power: 500W x 2 at 8Ω', 'Frequency response: 20Hz - 20kHz', 'Mic inputs: 2 with echo control']],
            ['category' => 'Audio', 'name' => 'Passive Main Speaker', 'brand' => 'Phaser', 'quantity' => 2, 'description' => 'Main PA speaker that needs an external amplifier to run', 'specs' => ['Type: Passive 2-way', 'Driver: 12 inch woofer + tweeter', 'Impedance: 8Ω', 'Cabinet: Wood']],
            ['category' => 'Audio', 'name' => 'Passive Main Speaker (Generic)', 'brand' => null, 'quantity' => 2, 'description' => 'Main PA speaker that needs an external amplifier to run', 'specs' => ['Type: Passive, needs external amplifier', 'Impedance: 8Ω']],
            ['category' => 'Audio', 'name' => 'External USB Sound Card', 'brand' => '5H V2', 'quantity' => 4, 'description' => 'Adds mic and headphone jacks to a laptop through USB', 'specs' => ['Channels: Virtual 7.1', 'Connection: USB 2.0', 'Output: 3.5mm stereo jack', 'Input: 3.5mm mono mic jack', 'Extras: Xear 3D sound effects']],

            ['category' => 'Cables', 'name' => 'XLR Male to Female Cable', 'brand' => null, 'quantity' => 4, 'description' => 'Standard 3-pin XLR cable for microphones and audio gear', 'specs' => ['Connectors: XLR male to XLR female', 'Type: 3-pin balanced']],
            ['category' => 'Cables', 'name' => 'XLR F2PL', 'brand' => null, 'quantity' => 2, 'description' => 'Connects a female XLR mic output to a 1/4 inch jack input', 'specs' => ['Connectors: XLR female to 1/4 inch plug']],
            ['category' => 'Cables', 'name' => 'XLR M2PL', 'brand' => null, 'quantity' => 2, 'description' => 'Connects a male XLR output to a 1/4 inch jack input', 'specs' => ['Connectors: XLR male to 1/4 inch plug']],
            ['category' => 'Cables', 'name' => 'Short XLR M2F', 'brand' => null, 'quantity' => 2, 'description' => 'Short XLR patch cable for close-range connections', 'specs' => ['Connectors: XLR male to XLR female', 'Type: 3-pin balanced']],
            ['category' => 'Cables', 'name' => 'XLR Tip Male', 'brand' => null, 'quantity' => 5, 'description' => 'Replacement 3-pin male XLR connector for cable repairs', 'specs' => ['Type: 3-pin XLR male connector']],
            ['category' => 'Cables', 'name' => 'XLR Tip Female', 'brand' => null, 'quantity' => 6, 'description' => 'Replacement 3-pin female XLR connector for cable repairs', 'specs' => ['Type: 3-pin XLR female connector']],
            ['category' => 'Cables', 'name' => 'Power Cord (AC Mains)', 'brand' => null, 'quantity' => 3, 'description' => 'AC power cord for speakers, amplifiers, and general equipment', 'specs' => ['Type: AC mains cord']],
            ['category' => 'Cables', 'name' => 'Audio Cable (1.5 meters)', 'brand' => null, 'quantity' => 1, 'description' => 'Short aux cable for phones and players into speakers', 'specs' => ['Length: 1.5 meters', 'Connector: 3.5mm aux']],
            ['category' => 'Cables', 'name' => 'Audio RCA Cable', 'brand' => null, 'quantity' => 2, 'description' => 'Links mixers, amplifiers and media players together', 'specs' => ['Connector: RCA']],
            ['category' => 'Cables', 'name' => 'Audio Cable (3.5mm Aux)', 'brand' => null, 'quantity' => 7, 'description' => 'General-purpose auxiliary cable for speakers and mixers', 'specs' => ['Type: Auxiliary audio cable', 'Connector: 3.5mm']],
            ['category' => 'Cables', 'name' => 'RCA to BNC Connector', 'brand' => null, 'quantity' => 10, 'description' => 'Joins RCA audio/video gear to BNC equipment', 'specs' => ['Connectors: RCA to BNC']],
            ['category' => 'Cables', 'name' => 'Coax Cable BNC-BNC', 'brand' => null, 'quantity' => 3, 'description' => 'Video cable for cameras and monitors', 'specs' => ['Impedance: 75Ω', 'Connectors: BNC to BNC']],
            ['category' => 'Cables', 'name' => 'Coax Cable BNC-RCA', 'brand' => null, 'quantity' => 3, 'description' => 'Links BNC video outputs to RCA inputs', 'specs' => ['Impedance: 75Ω', 'Connectors: BNC to RCA']],
            ['category' => 'Cables', 'name' => 'Coax Cable (Video)', 'brand' => 'Trident', 'quantity' => 7, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565960/broadtrack/36d190debbb3c79d6638ae979f16cbe8.webp', 'description' => 'Video coaxial cable for camera and monitor feeds', 'specs' => ['Impedance: 75Ω', 'Type: Video coaxial']],
            ['category' => 'Cables', 'name' => 'HDMI Cable', 'brand' => null, 'quantity' => 5, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565946/broadtrack/6687acf9a4600f6fd6b17e43d4c474ff.webp', 'description' => 'Carries video and audio between screens, players, and projectors', 'specs' => ['Connector: HDMI Type-A']],
            ['category' => 'Cables', 'name' => 'Mini HDMI', 'brand' => null, 'quantity' => 2, 'description' => 'Connects cameras and small devices to screens', 'specs' => ['Connector: Mini HDMI (Type-C)']],
            ['category' => 'Cables', 'name' => 'VGA Cable', 'brand' => null, 'quantity' => 1, 'description' => 'Connects computers to projectors and monitors', 'specs' => ['Connector: VGA (HD-15)']],
            ['category' => 'Cables', 'name' => 'DVI to HDMI', 'brand' => null, 'quantity' => 1, 'description' => 'Connects PCs with DVI output to HDMI displays', 'specs' => ['Connectors: DVI to HDMI']],
            ['category' => 'Cables', 'name' => 'USB to Type C Cable', 'brand' => null, 'quantity' => 1, 'description' => 'Charging and data cable for USB-C devices', 'specs' => ['Connectors: USB-A to USB-C']],
            ['category' => 'Cables', 'name' => 'VGA to HDMI Converter', 'brand' => null, 'quantity' => 1, 'description' => 'Connects older VGA devices to modern HDMI displays', 'specs' => ['Input: VGA (HD-15)', 'Output: HDMI']],
            ['category' => 'Cables', 'name' => 'VGA to HDMI Cable', 'brand' => null, 'quantity' => 1, 'description' => 'Connects older laptops to HDMI screens', 'specs' => ['Connectors: VGA (HD-15) to HDMI']],

            ['category' => 'Video', 'name' => 'LED Television (20 inches)', 'brand' => 'Lexing', 'quantity' => 2, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565956/broadtrack/e26ed881a667a41c2c14bab3be50a608.webp', 'description' => 'Small display for presentations and event screens', 'specs' => ['Resolution: HD', 'Brightness: 400 cd/m²', 'Contrast ratio: 3000:1', 'LED backlight life: 50,000 hours', 'Voltage: AC 220 - 240V, 50/60Hz']],
            ['category' => 'Video', 'name' => 'LED Television (55 inches)', 'brand' => 'Skyworth', 'quantity' => 1, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565958/broadtrack/5f3d41f176cee66148e0e3d86fbc3ba0.webp', 'description' => 'Large display for big-room presentations and screenings', 'specs' => ['Resolution: 4K UHD (3840 x 2160)', 'Refresh rate: 60Hz', 'Audio: Dolby Digital']],
            ['category' => 'Video', 'name' => 'TV Monitor', 'brand' => 'DeVant', 'quantity' => 1, 'description' => 'LED display used as a monitor or event screen', 'specs' => ['Resolution: Full HD', 'Inputs: HDMI, USB', 'Tuner: ISDB-T']],
            ['category' => 'Video', 'name' => 'HDMI Splitter (1080p 3D HDTV)', 'brand' => 'HDTV Splitter Ver. 1.4', 'quantity' => 1, 'description' => 'Duplicates one HDMI source to two screens at the same time', 'specs' => ['HDMI version: 1.4', 'Bandwidth: 4.95Gbps', 'Support: 1080p Full HD and 3D', 'Outputs: 1 input, 2 outputs']],
            ['category' => 'Video', 'name' => 'Channel Operator Controller', 'brand' => 'DMX 384', 'quantity' => 1, 'description' => 'Controls stage lighting scenes and effects from one console', 'specs' => ['DMX channels: 384', 'Fixtures: up to 12 (32 channels each)', 'Scene banks: 30 banks x 8 scenes', 'Chases: 6 programmable', 'Control faders: 8 x 4']],
            ['category' => 'Video', 'name' => 'USB Hub', 'brand' => null, 'quantity' => 1, 'description' => 'Expands one USB port into several for multiple devices', 'specs' => ['Ports: 4', 'Interface: USB', 'Power: Bus-powered']],
            ['category' => 'Video', 'name' => 'USB to Micro', 'brand' => null, 'quantity' => 1, 'description' => 'Charging and data cable for micro USB devices', 'specs' => ['Connectors: USB-A to Micro-USB']],
            ['category' => 'Video', 'name' => 'Video Converter', 'brand' => null, 'quantity' => 1, 'description' => 'Converts video signals between different connection types', 'specs' => ['Type: Video signal converter', 'Use: Connecting mismatched video devices']],
            ['category' => 'Video', 'name' => 'Video Capture', 'brand' => null, 'quantity' => 2, 'description' => 'Records camera or HDMI footage onto a computer', 'specs' => ['Capture: 1080p 60fps', 'Interface: USB 3.0', 'Standard: UVC plug and play']],

            ['category' => 'Camera', 'name' => 'Camera Tripod', 'brand' => 'Yunteng VCT 5208', 'quantity' => 2, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565962/broadtrack/986789faa211bc237ce5b91d5ee4ccc4.webp', 'description' => 'Steadies phones and cameras for photos and video, with Bluetooth remote', 'specs' => ['Max height: 125cm', 'Folded length: 43cm', 'Weight: ~600g', 'Max load: 1.5kg', 'Head: 3D pan/tilt (360° pan, 90° down, 65° up)', 'Mount: 1/4" screw', 'Legs: 3 sections, aluminum alloy']],
            ['category' => 'Camera', 'name' => 'Camera Tripod (55-inch)', 'brand' => 'Zomei Q111', 'quantity' => 2, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565965/broadtrack/d50d835dab83d3dcd3cfb14369e56e07.webp', 'description' => 'Sturdy full-height travel tripod for cameras and camcorders', 'specs' => ['Max height: 145cm', 'Min height: 45cm', 'Folded length: 50cm', 'Weight: ~1.2kg', 'Max load: 5kg', 'Legs: 4 sections, aluminum alloy', 'Bubble level']],
            ['category' => 'Camera', 'name' => 'Tripod Adapter Cell Phone Holder Mount', 'brand' => 'Pxel Universal Smart Phone', 'quantity' => 3, 'description' => 'Clamps a smartphone onto any tripod for mobile filming', 'specs' => ['Clip range: 55 - 85mm', 'Mount: 1/4" screw thread', 'Extendable']],
            ['category' => 'Camera', 'name' => 'Handy Cameras', 'brand' => null, 'quantity' => 4, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565949/broadtrack/062be972913e33b9e7ff81abb5fe8e2a.webp', 'description' => 'Compact handheld camera for event coverage', 'specs' => ['Type: Handheld camcorder', 'Video: Full HD 1080p', 'Screen: Rotatable LCD']],

            ['category' => 'Lighting', 'name' => 'LED Dimmable Light w/ 2.4G Wireless Remote', 'brand' => null, 'quantity' => 2, 'image' => 'https://res.cloudinary.com/dkxad8nc/image/upload/v1791565952/broadtrack/13559dbee4b6b0bd7cc9d8d05fcbc623.webp', 'description' => 'Adjustable-brightness LED panel controlled by wireless remote', 'specs' => ['Light source: LED', 'Control: 2.4G wireless remote', 'Brightness: Dimmable']],
            ['category' => 'Lighting', 'name' => 'LED Stage PAR Light', 'brand' => null, 'quantity' => 4, 'description' => 'Washes stages and venues with colored stage lighting', 'specs' => ['Light source: LED', 'Type: PAR can', 'Use: Stage color washes']],
            ['category' => 'Lighting', 'name' => 'Light Stand', 'brand' => null, 'quantity' => 2, 'description' => 'Mounts lights and softboxes at working height', 'specs' => ['Height: Adjustable', 'Sections: 3', 'Mount: 1/4" screw']],
            ['category' => 'Lighting', 'name' => 'Softbox Lighting Kit 50x70CM and 85W LED Bulb Lamp', 'brand' => null, 'quantity' => 1, 'description' => 'Produces soft, even light for photo and video shoots', 'specs' => ['Softbox size: 50 x 70cm', 'Bulb: 85W LED']],
            ['category' => 'Lighting', 'name' => 'Photographic Video Studio Adjustable Background Stand', 'brand' => null, 'quantity' => 2, 'description' => 'Holds backdrops and backgrounds for photo shoots', 'specs' => ['Width: Adjustable up to ~3m', 'Height: Adjustable up to ~2.1m', 'Frame: Telescopic crossbar']],
            ['category' => 'Lighting', 'name' => 'Camera Lighting Reflector Diffuser Kit', 'brand' => null, 'quantity' => 1, 'description' => 'Softens and bounces light for better shots', 'specs' => ['Type: Reflector with diffuser covers', 'Use: Softening and bouncing light']],
            ['category' => 'Lighting', 'name' => 'Flood Light', 'brand' => null, 'quantity' => 1, 'description' => 'Bright wide-coverage light for stages and venues', 'specs' => ['Light source: LED', 'Protection: IP65', 'Lifespan: ~50,000 hours']],
            ['category' => 'Lighting', 'name' => 'Laser Light', 'brand' => null, 'quantity' => 1, 'description' => 'Laser effect light for stage visuals during events', 'specs' => ['Type: Laser effect projector', 'Modes: Auto and sound-active', 'Power: AC 100 - 240V']],
        ];

        Equipment::withoutEvents(function () use ($equipment) {
            foreach ($equipment as $item) {
                $unitsCount = $item['quantity'] ?? 1;
                for ($unitIndex = 0; $unitIndex < $unitsCount; $unitIndex++) {
                    Equipment::create([
                        'category' => $item['category'],
                        'name' => $item['name'],
                        'brand' => $item['brand'],
                        'description' => $item['description'],
                        'specs' => implode("\n", $item['specs']),
                        'image' => $item['image'] ?? null,
                    ]);
                }
            }
        });
    }
}
