"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, MoreVertical, UserRound } from "lucide-react";

const useUser = () => ({
	name: "Mark Bannert",
	email: "mark@bannert.com",
	avatar:
		"https://res.cloudinary.com/dlzlfasou/image/upload/v1741345912/user_itiiaq.png",
});

export function NavUser() {
	const user = useUser();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1 border bg-card rounded-md">
				<Avatar className="in-data-[state=expanded]:size-6 transition-[width,height] duration-200 ease-in-out">
					<AvatarImage src={user.avatar} alt={user.name} />
					<AvatarFallback>CN</AvatarFallback>
				</Avatar>
				<div className="grid flex-1 text-left text-sm leading-tight ms-1">
					<span className="truncate font-medium">{user.name}</span>
				</div>
				<div className="size-8 rounded-lg flex items-center justify-center bg-sidebar.-accent/50 in-[[data-slot=dropdown-menu-trigger]:hover]:bg-transparent">
					<MoreVertical className="size-5 opacity-40" size={16} />
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg">
				<DropdownMenuItem className="gap-3 px-1 pl-2">
					<UserRound
						size={20}
						className="text-muted-foreground"
						aria-hidden="true"
					/>
					<span className="font-medium">Profile</span>
				</DropdownMenuItem>
				<DropdownMenuItem className="gap-3 px-1 pl-2">
					<LogOut size={20} className="text-destructive" aria-hidden="true" />
					<span className="font-medium">Log out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
