export default function Page() {
    return (
        <div className="flex flex-col gap-4 flex-1">
            {/* <div>Register here: </div> */}
            <iframe
                src="https://docs.google.com/forms/d/e/1FAIpQLSfMF3GF2TvUKSnCce-Vfy0XengH9pi6wllDCsnWkIFTa1f2fQ/viewform?embedded=true"
                className="flex-1 min-h-fit">
                Loading…
            </iframe>
        </div>
    );
}
