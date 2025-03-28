"use client";
import { useEffect, useState } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RiTodoLine } from "react-icons/ri";
import { Plus, Trash2 } from "lucide-react";

type Todo = {
    id: string;
    text: string;
    completed: boolean;
};

const TodoList = () => {
    const [newTodo, setNewTodo] = useState("");
    const [todos, setTodos] = useState<Todo[]>([]);

    // Load todos from localStorage on component mount
    useEffect(() => {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
            setTodos(JSON.parse(savedTodos));
        }
    }, []);

    // Save todos to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("todos", JSON.stringify(todos));
    }, [todos]);

    const handleAddTodo = () => {
        if (!newTodo.trim()) return;

        const todo: Todo = {
            id: crypto.randomUUID(),
            text: newTodo.trim(),
            completed: false,
        };

        setTodos((prev) => [...prev, todo]);
        setNewTodo("");
    };

    const handleToggleTodo = (id: string) => {
        setTodos((prev) =>
            prev.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const handleDeleteTodo = (id: string) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
    };

    return (
        <Popover>
            <PopoverTrigger className="cursor-pointer w-14 h-14 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800">
                <RiTodoLine className="text-zinc-900 dark:text-zinc-100 w-6 h-6" />
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-zinc-50 dark:bg-zinc-800">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h5 className="text-zinc-900 dark:text-zinc-100 text-sm font-medium">
                        TodoList ({todos.filter((t) => !t.completed).length}{" "}
                        remaining)
                    </h5>
                </div>
                {/* Divider */}
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2"></div>
                {/* Add Todo */}
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Add new todo..."
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        className="flex-1"
                        onKeyDown={(e) => e.key === "Enter" && handleAddTodo()}
                    />
                    <Button
                        size="icon"
                        onClick={handleAddTodo}
                        className="shrink-0"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                {/* Divider */}
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2"></div>
                {/* Todo List */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {todos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-zinc-500">
                            <span className="text-3xl mb-2">📝</span>
                            <p className="text-sm">
                                No todos yet. Add one above!
                            </p>
                        </div>
                    ) : (
                        todos.map((todo) => (
                            <div
                                key={todo.id}
                                className="flex items-center gap-2 group"
                            >
                                <Checkbox
                                    checked={todo.completed}
                                    onCheckedChange={() =>
                                        handleToggleTodo(todo.id)
                                    }
                                />
                                <span
                                    onClick={() => handleToggleTodo(todo.id)}
                                    className={`flex-1 text-sm cursor-pointer select-none ${
                                        todo.completed
                                            ? "line-through text-zinc-500"
                                            : "text-zinc-900 dark:text-zinc-100"
                                    }`}
                                >
                                    {todo.text}
                                </span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteTodo(todo.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default TodoList;
