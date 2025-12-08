import Image from "next/image";
import React from "react";

export default function ProgramClosed() {
    return (
        <div className="program-closed">
            <div>
                <Image src="/favicon.png" alt="logo" width={100} height={100} />
                <h1>සද්ධර්මධාරා - Saddharmadhara</h1>
                <h2>
                    සැලසුම් කළ සද්ධර්මධාරා භාවනා වැඩසටහන් අවසන් වූ බැවින් ඒ සදහා
                    ලියාපදිංචි වීම තාවකාලිකව නවතා ඇත.
                </h2>
                <h2>
                    Registration for the planned Saddharmadhara meditation programs has
                    been temporarily paused for the current season, as the programs have
                    now concluded.
                </h2>
            </div>
            <div>
                <p>
                    මෙතෙක් පැවති වැඩසටහන් නැරඹීමට අපගේ Youtube නාලිකාව හා සම්බන්ධ වන්න.
                </p>
                <p>Join our YouTube channel to watch the previous programs</p>
                <a
                    href="https://www.youtube.com/channel/UCXFiIVHYqQmgpmIi7KChMkQ"
                    target="_blank"
                    className="youtube-btn"
                    rel="noreferrer"
                >
                    Youtube
                </a>
            </div>
            <div>
                <p>
                    ඉදරි වැඩසටහන් පිළිබඳව දැනුවත් වීමට අපගේ Whatsapp සමූහයට එක් වන්න.
                </p>
                <p>Join our Whatsapp group to stay informed about upcoming programs</p>
                <a
                    href="https://srisambuddhamission.org/whatsapp"
                    target="_blank"
                    className="whatsapp-btn"
                    rel="noreferrer"
                >
                    Whatsapp
                </a>
            </div>
        </div>
    );
}
