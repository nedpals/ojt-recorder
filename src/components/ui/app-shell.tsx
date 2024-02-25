import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "./button";
import { ArrowLeft } from "lucide-react";

export default function AppShell({ title, left: LeftSide, right: RightSide, withBackButton = true, children }: {
    title: string
    left?: React.FC
    right?: React.FC
    withBackButton?: boolean
    children: React.ReactNode
}) {
    const loc = useLocation();
    const navigate = useNavigate();
    
    return (
        <div className="flex flex-col h-full">
            <header className="fixed inset-x-0 top-0 bg-white z-50 py-2 border-b">
                <div className="flex items-center px-2 max-w-6xl mx-auto">
                    {LeftSide ? 
                        <LeftSide /> : 
                        (withBackButton && loc.key !== 'default') && (
                            <Button size="icon" variant="ghost" onClick={() => navigate(-1)}>
                                <ArrowLeft />
                            </Button>
                        )}
                    <span className="font-bold mx-auto">{title}</span>
                    {RightSide ? 
                        <RightSide /> : (withBackButton && loc.key !== 'default') && (
                            <div className="w-12"></div>
                        )}
                </div>
            </header>
            
            <main className="flex-1 h-full mt-[3.55rem]">
                {children}
            </main>
        </div>
    );
}
