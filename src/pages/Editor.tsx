// import { pb } from "@/pocketbase";
// import { Navigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";

import { Button } from "@/components/ui/button";
import { Copy, List, ListChecks, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { FC, HTMLAttributes, MouseEventHandler, useCallback, useRef, useState } from "react";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import AppShell from "@/components/ui/app-shell";
import { on } from "events";

const noteTypes = {
    'task': 'Task',
    'problem': 'Problem',
    'note': 'Note'
} as const;

const availableBreakTimesInSeconds = {
    "5 minutes": 5 * 60,
    "10 minutes": 10 * 60,
    "15 minutes": 15 * 60,
    "30 minutes": 30 * 60,
    "1 hour": 60 * 60,
    "2 hours": 2 * 60 * 60,
    "3 hours": 3 * 60 * 60,
    "Break for the day": 8 * 60 * 60
}

interface NoteItem {
    id: number
    text: string
    type: 'task' | 'problem' | 'note'
}

function NoteItemContent({ 
    actions: Actions,
    className, 
    numberText, 
    inputDisabled, 
    defaultContentValue = '',
    inputPlaceholder,
    onContentChange, 
    onContentMouseEnter, 
    onInputMouseDown, 
    onContentMouseLeave, 
    ...props }: {
    numberText?: string
    actions?: FC
    defaultContentValue?: string
    onContentMouseEnter?: MouseEventHandler<HTMLDivElement>
    onContentMouseLeave?: MouseEventHandler<HTMLDivElement>
    onContentChange?: (text: string) => void
    onInputMouseDown?: MouseEventHandler<HTMLInputElement>
    inputDisabled?: boolean
    inputPlaceholder?: string
} & HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn(className, "note-item-content bg-white")} {...props}>
            <div className="min-h-14 max-w-6xl mx-auto flex">
                <div 
                    onMouseEnter={onContentMouseEnter}
                    onMouseLeave={onContentMouseLeave} 
                    className="pl-2 flex-1 flex items-center space-x-4">
                    {numberText && 
                        <span className="pointer-events-none select-none rounded-full bg-slate-100 h-8 w-8 text-center text-slate-500 flex items-center justify-center">
                            {numberText}
                        </span>}
                    <input 
                        type="text" 
                        className={cn(
                            inputDisabled && 'pointer-events-none', 
                            "outline-none flex-1 h-full bg-transparent disabled:bg-transparent")} 
                        defaultValue={defaultContentValue}
                        onMouseDown={onInputMouseDown}
                        placeholder={inputPlaceholder}
                        onKeyDown={(ev) => {
                            if (ev.key === 'Enter') {
                                const text = ev.currentTarget.value.trim();
                                if (text.length < 4) {
                                    if (text.length === 0) {
                                        ev.currentTarget.value = defaultContentValue;
                                    }
                                    
                                    return;
                                }
                                onContentChange?.(text);
                                ev.currentTarget.value = '';
                            }
                        }}
                        onBlur={(ev) => {
                            const text = ev.target.value.trim();
                            if (text.length < 4 || text === defaultContentValue) {
                                if (text.length === 0) {
                                    ev.target.value = defaultContentValue;
                                }
                                
                                return;
                            }
                            onContentChange?.(text);
                        }} />
                </div>
                
                {Actions && <Actions />}
            </div>
        </div>
    );
}

function NotesList({ notes, onChange }: {
    notes: NoteItem[],
    onChange?: (state: 'created' | 'deleted' | 'updated', note: NoteItem) => void
}) {
    const swipeHandlers = useSwipeable({
        trackMouse: true,
        trackTouch: true,
        preventScrollOnSwipe: true,
        delta: 50,
        onSwipeStart: (ev) => {
            const id = getTaskIdFromTarget(ev.event.target);
            if (id === null) {
                return;
            }
            activate(id);
        },
        onSwiped: (ev) => {
            const gap = Math.abs(ev.absX - ev.initial[0]);
            if (gap >= 300) {
                setDeletedTaskId(activeTaskId);
                setTimeout(() => {
                    onChange?.('deleted', notes.find((n) => n.id === activeTaskId)!);
                    setDeletedTaskId(null);
                    resetActive();
                }, 200);
                return;
            }
            resetActive();
        },
        onSwiping: (ev) => {
            if (activeTaskId === null) return;
            setDeltaX(ev.deltaX);
        },
    });
    
    const [deletedTaskId, setDeletedTaskId] = useState<number | null>(null);
    const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
    const [deltaX, setDeltaX] = useState<number | null>(null);
    const activeNoteItemTextBox = useRef<HTMLInputElement | null>(null);
    
    function getTaskIdFromTarget(initialTarget: EventTarget | null) {
        let target = initialTarget;
        
        for (;;) {
            if (!target || !(target instanceof HTMLElement)) {
                return null;
            }
            
            const rawId = target.dataset.id;
            if (!rawId) {
                target = target.parentElement;
                continue;
            }
            
            const id = parseInt(rawId);
            if (isNaN(id)) {
                return null;
            }
            
            return id;
        }
    }

    function activate(i: number) {
        setActiveTaskId(i);
        setDeltaX(null);
    }

    function resetActive(resetDeltaX = true) {
        setActiveTaskId(null);
        if (resetDeltaX) {
            setDeltaX(null);
        }
    }
    
    function addNote(text: string) {
        if (text.length < 4) {
            return;
        }
        onChange?.('created', {
            id: notes.length,
            text,
            type: 'note'
        });
    }
    
    const isSwiping = useCallback((id: number) => {
        return activeTaskId === id && deltaX !== null;
    }, [activeTaskId, deltaX]);
    
    return (
        <ScrollArea className="flex flex-col h-full">
            {notes.map((note, i) => (
                <div 
                    data-id={note.id}
                    key={`note_item_${note.id}`}
                    className={cn(
                        isSwiping(note.id) && 'overflow-hidden select-none', 
                        deletedTaskId === note.id && 'animate-delete',
                        "note-item border-y bg-red-100")}>
                    
                    <NoteItemContent
                        defaultContentValue={note.text}
                        {...swipeHandlers}
                        numberText={`${i + 1}`}
                        style={isSwiping(note.id) ? { transform: `translateX(${deltaX}px)` } : {}}
                        inputDisabled={activeTaskId !== note.id && deltaX !== null}
                        onContentMouseEnter={() => {
                            if (activeTaskId === null && !activeNoteItemTextBox.current) {
                                activate(note.id);
                            }
                        }}
                        onContentMouseLeave={() => { 
                            if (deltaX === null && (!activeNoteItemTextBox.current || activeNoteItemTextBox.current !== document.activeElement)) {
                                resetActive(false); 
                            }
                        }}
                        onContentChange={() => {
                            onChange?.('updated', {
                                ...note,
                                text: note.text
                            });
                        }}
                        actions={() => (
                            <div className={cn(isSwiping(note.id) ? "hidden" : "flex", "justify-end space-x-2 pr-2 py-2")}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost" className="active:outline-none">
                                            <ListChecks />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuRadioGroup 
                                            value={note.type} onValueChange={(newType) => {
                                                onChange?.('updated', {
                                                    ...note,
                                                    type: newType as keyof typeof noteTypes
                                                });
                                            }}>
                                            {Object.entries(noteTypes).map(([key, value]) => (
                                                <DropdownMenuRadioItem key={key} value={key}>
                                                    {value}
                                                </DropdownMenuRadioItem>
                                            ))}
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                
                                <Button size="icon" variant="ghost">
                                    <Copy />
                                </Button>
                            </div>
                        )} />
                </div>
            ))}
            
            <NoteItemContent
                numberText="+"
                className="border-y"
                inputPlaceholder="Add a note"
                onContentChange={addNote} />
        </ScrollArea>
    );
}

enum EditorState {
    Idle,
    Running,
    Break,
    Stopped
}

function ControlCenter({ state = EditorState.Idle, onStateChange, className }: { 
    state: EditorState
    className: string 
    onStateChange?: (state: EditorState) => void
}) {
    const [breakDialogOpen, setBreakDialogOpen] = useState(false);
    
    return (
        <div className={cn(className, "flex flex-col space-y-4")}>
            <div className="flex flex-wrap">
                <div className="pt-4 lg:pt-0 order-2 lg:order-1 w-1/2 lg:w-auto lg:flex-1 flex flex-row lg:flex-col items-center justify-center space-y-0 space-x-2 lg:space-x-0 lg:space-y-2">
                    <p className="text-sm text-slate-600 tracking-wide uppercase">Time in</p>
                    <p className="text-3xl lg:text-5xl">06:44 PM</p>
                </div>
                
                <div className="order-1 lg:order-2 w-full lg:w-auto lg:flex-1 flex flex-col items-center space-y-0 lg:space-y-2">
                    <p className="text-sm text-slate-600 tracking-wide uppercase">
                        {state === EditorState.Idle && "Idle"}
                        {state === EditorState.Running && "Running"}
                        {state === EditorState.Break && "On break"}
                        {state === EditorState.Stopped && "Active for"}
                    </p>
                    <p className="text-3xl lg:text-5xl">06:00:01</p>
                </div>

                <div className="pt-4 lg:pt-0 order-3 w-1/2 lg:w-auto lg:flex-1 flex flex-row lg:flex-col items-center justify-center space-y-0 space-x-2 lg:space-x-0 lg:space-y-2">
                    <p className="text-sm text-slate-600 tracking-wide uppercase">Time out</p>
                    <p className="text-3xl lg:text-5xl">06:44 PM</p>
                </div>
            </div>

            <div className="flex space-x-2">
                <Button variant="success" size="lg" 
                    disabled={state === EditorState.Running || state === EditorState.Break}
                    onClick={() => onStateChange?.(EditorState.Running)}
                    className="flex-1 text-xl lg:text-2xl lg:py-8">
                    Clock in
                </Button>
                <Button variant="destructive" size="lg" 
                    disabled={state === EditorState.Stopped || state === EditorState.Break || state === EditorState.Idle}
                    onClick={() => onStateChange?.(EditorState.Stopped)}
                    className="flex-1 text-xl lg:text-2xl lg:py-8">Clock out</Button>
            </div>

            <Button size="lg" variant="secondary" 
                onClick={() => {
                    if (state !== EditorState.Break) {
                        return setBreakDialogOpen(true);
                    }
                    
                    onStateChange?.(EditorState.Running);
                }}
                className="text-xl py-6 w-3/4 mx-auto">
                {state !== EditorState.Break ? "Take a break" : "Resume"}
            </Button>
            
            {state !== EditorState.Break && <Drawer open={breakDialogOpen} onOpenChange={setBreakDialogOpen}>
                <DrawerTrigger asChild>
                </DrawerTrigger>

                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>Set a break</DrawerTitle>
                        <DrawerDescription>Set number of hours before resuming work.</DrawerDescription>
                    </DrawerHeader>

                    <ScrollArea className="h-96">
                        <div className="flex flex-col space-y-4 px-2 pt-2 pb-12">
                            {Object.entries(availableBreakTimesInSeconds).map(([label, seconds]) => (
                                <Button key={`break_${label}`} size="lg" variant="ghost" className="text-left text-lg py-4" onClick={() => {
                                    console.log(label, seconds);
                                    setBreakDialogOpen(false);
                                    onStateChange?.(EditorState.Break);
                                }}>
                                    {label}
                                </Button>
                            ))}
                        </div>
                    </ScrollArea>
                </DrawerContent>
            </Drawer>}
        </div>
    );
}

export default function Editor() {
    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [state, setState] = useState<EditorState>(EditorState.Idle);

    // if (!pb.authStore.model) {
    //     return <Navigate to="/login" />;
    // }

    return (
        <AppShell 
            title="Home"
            left={() => (
                <Button size="icon" variant="ghost" asChild>
                    <Link to="/list"><List /></Link>
                </Button>
            )}
            right={() => (
                <Button size="icon" variant="ghost">
                    <LogOut className="text-red-500" />
                </Button>
            )}>
            <div className="h-full">
                <div className="mb-[17rem]">
                    <NotesList 
                        notes={notes}
                        onChange={(state, item) => {
                            if (state === 'created') {
                                setNotes([...notes, item]);
                            } else if (state === 'deleted') {
                                setNotes(notes.filter((n) => n.id !== item.id));
                            } else if (state === 'updated') {
                                setNotes(notes.map((n) => n.id === item.id ? item : n));
                            }
                        }} />
                </div>

                <div className="fixed inset-x-0 bottom-0 bg-white border-t h-[17rem]">
                    <ControlCenter 
                        state={state}
                        onStateChange={setState}
                        className="max-w-6xl mx-auto px-4 py-4" />
                </div>
            </div>
        </AppShell>
    );
}

// export const editorLoader: LoaderFunction = async ({ params }) => {
//     if (params.id) {
        
//     }
// }
