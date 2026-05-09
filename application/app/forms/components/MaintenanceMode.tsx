import Image from "next/image";
import React from "react";

export default function MaintenanceMode() {
    return (
        <div className="maintenance-mode">
            <div>
                <Image src="/favicon.png" alt="logo" width={100} height={100} />
                <h1>සද්ධර්මධාරා - Saddharmadhara</h1>
                <div className="maintenance-content">
                    <h2>
                        පද්ධතියේ නඩත්තු කටයුත්තක් හේතුවෙන් අයදුම්පත්‍රය තාවකාලිකව අක්‍රිය කර ඇත.
                        කරුණාකර පැය කිහිපයකින් නැවත උත්සාහ කරන්න.
                    </h2>
                    <h2>
                        The application form is temporarily unavailable due to scheduled maintenance.
                        Please check back in a few hours.
                    </h2>
                </div>
            </div>
            <div className="maintenance-footer">
                <p>අපහසුතාවය පිළිබඳව අපගේ කණගාටුව ප්‍රකාශ කරමු.</p>
                <p>We apologize for any inconvenience caused.</p>
            </div>
        </div>
    );
}
