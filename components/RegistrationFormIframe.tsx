export default function RegistrationFormIframe() {
    return (
        <iframe
            src={`${process.env.FORM_LINK!}?embedded=true`}
            className="flex-1"
            title="Registration form"
            loading="lazy"
            allowFullScreen
        />
    );
}
