import AppShell from "@/components/ui/app-shell";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChevronRight, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

function AddDayButton({ week }: { week: number }) {
    const form = useForm();
    const formRef = useRef<HTMLFormElement | null>(null);
    const [open, setOpen] = useState(false);
    
    return (
        <Drawer open={open} onOpenChange={(o) => setOpen(o)}>
            <DrawerTrigger asChild>
                <button className="group rounded-lg border hover:border-slate-600 hover:bg-slate-50 bg-white px-4 py-2 flex items-center space-x-2">
                    <Plus className="text-slate-500 group-hover:text-slate-800" />
                    <p>Add day</p>
                </button>
            </DrawerTrigger>
            
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Add Day for Week {week}</DrawerTitle>
                    <DrawerDescription>Fill in the details for the day</DrawerDescription>
                </DrawerHeader>
                
                <div className="px-4 py-8">
                    <Form {...form}>
                        <form 
                            ref={formRef} 
                            className="space-y-8"
                            onSubmit={form.handleSubmit((data) => console.log(data))}>
                            <FormField 
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormDescription>Select the date for the day.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )} />
                            
                            <FormField 
                                control={form.control}
                                name="hours"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Number of hours</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormDescription>Specify the number of hours you need to work for that day.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                                )} />
                        </form>
                    </Form>
                </div>
                
                <DrawerFooter>
                    <Button onClick={() => formRef.current?.dispatchEvent(new Event('submit', { cancelable: true }))}>
                        Submit
                    </Button>
                    <Button variant="secondary" onClick={() => setOpen(false)}>
                        Cancel
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export default function List() {
    return (
        <AppShell title="List">
            <div className="max-w-6xl mx-auto py-2">
                {[...Array(8).keys()].map((i) => (
                    <div key={`week_${i}`} className="flex flex-col px-4 pt-2 pb-6 space-y-2">
                        <div className="bg-slate-50 rounded-lg p-4 flex justify-between items-center">
                            <div className="space-y-2">
                                <h3 className="text-3xl font-bold">Week {i+1}</h3>
                                <div className="divide-x flex">
                                    <p className="font-semibold pr-2">300 hours</p>
                                    <p className="text-slate-600 pl-2">January 1 - January 6</p>
                                </div>
                            </div>
                            
                            <Button>Summary</Button>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                            {[...Array(5).keys()].map((j) => (
                                <Link to="/" className="group rounded-lg border hover:border-slate-600 hover:bg-slate-50 bg-white px-4 py-2 flex items-center justify-between">
                                    <div className="space-y-2">
                                        <h4 className="text-2xl font-bold">Day {((i * 5) + j) + 1}</h4>
                                        <div className="divide-x flex">
                                            <p className="text-slate-600 pr-2">January 1</p>
                                            <p className="text-slate-600 px-2">Completed</p>
                                            <p className="font-semibold pl-2">8 hours</p>
                                        </div>
                                    </div>
                                    
                                    <ChevronRight className="text-slate-500 group-hover:text-slate-800" size={34} />
                                </Link>
                            ))}
                            
                            <AddDayButton week={i+1} />
                        </div>
                    </div>
                ))}
            </div>
        </AppShell>
    )
}
