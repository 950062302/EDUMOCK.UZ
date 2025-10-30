"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import { CefrCentreFooter } from "@/components/CefrCentreFooter"; // Updated import
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

const UserProfile: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">User Profile</CardTitle>
            <CardDescription>View and update your profile information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                <AvatarFallback>
                  <User className="h-12 w-12 text-muted-foreground" />
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">John Doe</h3>
              <p className="text-muted-foreground">john.doe@example.com</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-base">Full Name</Label>
                <Input id="full-name" type="text" placeholder="Your full name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-profile" className="text-base">Email Address</Label>
                <Input id="email-profile" type="email" placeholder="Your email" defaultValue="john.doe@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-base">Bio</Label>
                <Input id="bio" type="text" placeholder="Tell us about yourself" defaultValue="A passionate learner." />
              </div>
            </div>
            <Button className="w-full">Save Profile</Button>
          </CardContent>
        </Card>
      </main>
      <CefrCentreFooter /> {/* Replaced MadeWithDyad */}
    </div>
  );
};

export default UserProfile;