import { REGISTRATION_FORM_LINK } from "@/lib/settings";

export default function RegistrationFormIframe() {
    return (
        <iframe
            src={`${REGISTRATION_FORM_LINK}?embedded=true`}
            className="flex-1 bg-white"
            title="Registration form"
            loading="lazy"
            allowFullScreen
        />
    );
}
