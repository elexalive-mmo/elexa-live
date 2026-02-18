import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext({ value: "", onValueChange: () => { } });

const Tabs = ({ defaultValue, value, onValueChange, children, className, ...props }) => {
    const [stateValue, setStateValue] = React.useState(defaultValue || "");
    const current = value !== undefined ? value : stateValue;
    const change = onValueChange || setStateValue;

    return (
        <TabsContext.Provider value={{ value: current, onValueChange: change }}>
            <div className={cn("", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
}

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
            className
        )}
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value, ...props }, ref) => {
    const { value: selected, onValueChange } = React.useContext(TabsContext);
    const isActive = selected === value;
    return (
        <button
            ref={ref}
            type="button"
            onClick={() => onValueChange(value)}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive && "bg-background text-foreground shadow",
                className
            )}
            {...props}
        />
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value, children, ...props }, ref) => {
    const { value: selected } = React.useContext(TabsContext);
    if (selected !== value) return null;
    return (
        <div
            ref={ref}
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-0 zoom-in-95",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
