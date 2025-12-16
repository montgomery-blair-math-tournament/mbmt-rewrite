export default function TitleCard() {
    return (
        <div className="flex flex-col gap-8 w-full h-full justify-center align-middle">
            <div className="flex text-center gap-4 flex-col justify-center flex-1 items-center">
                <div className="text-6xl font-extrabold text-center">
                    Montgomery Blair Math Tournament
                </div>

                <div>
                    A middle-school math competition intended for middle
                    schoolers who attend middle school at a middle school.
                </div>
            </div>

            {/* <motion.div
                className="flex justify-center h-fit w-full bottom-0 self-end"
                onHoverStart={() => setArrowScale(1.2)}
                onHoverEnd={() => setArrowScale(1)}
            >
                <motion.div
                    className="h-fit p-16"
                    animate={{
                        scale: arrowScale,
                        transition: { duration: 0.1 },
                    }}
                >
                    <ArrowDownwardIcon />
                </motion.div>
            </motion.div> */}
        </div>
    );
}
