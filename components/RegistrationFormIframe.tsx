export default function RegistrationFormIframe() {
    return (
        <iframe
            src={`${process.env.NEXT_PUBLIC_FORM_LINK!}?embedded=true`}
            className="flex-1"
            title="Registration form"
            loading="lazy"
            allowFullScreen
        />
    );
}
