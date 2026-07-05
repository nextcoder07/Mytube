// src/controllers/notes.controller.ts
import { Request, Response, NextFunction } from "express";
import NotesService from "../services/notes.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const getNotes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const notes = await NotesService.getNotes(user.uid);
    res.status(200).json(success(notes, "Notes fetched successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const getNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const note = await NotesService.getNote(user.uid, req.params.id);
    res.status(200).json(success(note, "Note fetched successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const createNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const note = await NotesService.createNote(user.uid, req.body);
    res.status(201).json(success(note, "Note created successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const updateNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const note = await NotesService.updateNote(user.uid, req.params.id, req.body);
    res.status(200).json(success(note, "Note updated successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const deleteNote = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    await NotesService.deleteNote(user.uid, req.params.id);
    res.status(200).json(success(null, "Note deleted successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const generateFlashcards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const flashcards = await NotesService.generateFlashcards(user.uid, req.params.id);
    res.status(200).json(success(flashcards, "AI Flashcards generated successfully"));
  } catch (err: any) {
    next(err);
  }
};
