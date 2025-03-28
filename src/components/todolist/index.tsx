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
import { motion, AnimatePresence } from "framer-motion";

type Todo = {
    id: string;
    text: string;
    completed: boolean;
};

const listVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
};

const TodoList = () => {
    const [newTodo, setNewTodo] = useState("");
    const [todos, setTodos] = useState<Todo[]>([]);

    useEffect(() => {
        const savedTodos = localStorage.getItem("todos");
        if (savedTodos) {
            setTodos(JSON.parse(savedTodos));
        }
    }, []);

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

    const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            action();
        }
    };

    return (
        <Popover>
            <PopoverTrigger
                className="cursor-pointer w-14 h-14 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800"
                aria-label="Open todo list"
            >
                <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <RiTodoLine className="text-zinc-900 dark:text-zinc-100 w-6 h-6" />
                </motion.div>
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
                        aria-label="New todo input"
                    />
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Button
                            size="icon"
                            onClick={handleAddTodo}
                            className="shrink-0"
                            aria-label="Add todo"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </motion.div>
                </div>
                {/* Divider */}
                <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2"></div>
                {/* Todo List */}
                <motion.div
                    className="space-y-2 max-h-[300px] overflow-y-auto"
                    variants={listVariants}
                    initial="hidden"
                    animate="show"
                >
                    <AnimatePresence mode="popLayout">
                        {todos.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center justify-center py-6 text-zinc-500"
                            >
                                <span
                                    className="text-3xl mb-2"
                                    role="img"
                                    aria-label="Notepad emoji"
                                >
                                    📝
                                </span>
                                <p className="text-sm">
                                    No todos yet. Add one above!
                                </p>
                            </motion.div>
                        ) : (
                            todos.map((todo) => (
                                <motion.div
                                    key={todo.id}
                                    variants={itemVariants}
                                    layout
                                    className="flex items-center gap-2 group relative pr-2 overflow-hidden"
                                >
                                    <Checkbox
                                        id={`todo-${todo.id}`}
                                        checked={todo.completed}
                                        onCheckedChange={() =>
                                            handleToggleTodo(todo.id)
                                        }
                                        aria-label={`Mark "${todo.text}" as ${
                                            todo.completed
                                                ? "incomplete"
                                                : "complete"
                                        }`}
                                    />
                                    <motion.span
                                        layout
                                        onClick={() =>
                                            handleToggleTodo(todo.id)
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(e, () =>
                                                handleToggleTodo(todo.id)
                                            )
                                        }
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Toggle "${todo.text}" completion`}
                                        animate={{
                                            color: todo.completed
                                                ? "#71717a"
                                                : "#18181b",
                                            opacity: todo.completed ? 0.5 : 1,
                                        }}
                                        className="flex-1 text-sm cursor-pointer select-none truncate"
                                    >
                                        {todo.text}
                                    </motion.span>
                                    <motion.div
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="invisible group-hover:visible absolute right-0"
                                    >
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8"
                                            onClick={() =>
                                                handleDeleteTodo(todo.id)
                                            }
                                            aria-label={`Delete "${todo.text}"`}
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </motion.div>
            </PopoverContent>
        </Popover>
    );
};

export default TodoList;
