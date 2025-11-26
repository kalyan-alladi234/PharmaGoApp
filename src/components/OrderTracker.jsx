function classNames(...c) {
  return c.filter(Boolean).join(" ");
}

/**
 * steps: array of step names in order (e.g., ["Processing","Shipped","Out for Delivery","Delivered"])
 * current: current status string
 */
function OrderTracker({ steps, current }) {
  const currentIndex = Math.max(steps.indexOf(current), 0);
  return (
    <div className="w-full">
      <ol className="flex items-center w-full">
        {steps.map((s, i) => {
          const done = i <= currentIndex;
          return (
            <li key={s} className={classNames("flex-1 flex items-center")}>
              <div className="flex flex-col items-center text-center w-full">
                <div
                  className={classNames(
                    "w-8 h-8 rounded-full flex items-center justify-center border",
                    done ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-500 border-gray-300"
                  )}
                >
                  {i + 1}
                </div>
                <span className={classNames("text-xs mt-2", done ? "text-green-600" : "text-gray-600")}>{s}</span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={classNames(
                    "h-1 flex-1 mx-2 rounded",
                    i < currentIndex ? "bg-green-500" : "bg-gray-300"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default OrderTracker;
