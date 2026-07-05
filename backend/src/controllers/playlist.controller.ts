// src/controllers/playlist.controller.ts
import { Request, Response, NextFunction } from "express";
import PlaylistService from "../services/playlist.service";
import { success } from "../utils/response";
import { HttpError } from "../utils/errors";

export const getPlaylists = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const playlists = await PlaylistService.getPlaylists(user.uid);
    res.status(200).json(success(playlists, "Playlists fetched"));
  } catch (err: any) {
    next(err);
  }
};

export const getPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const playlist = await PlaylistService.getPlaylist(user.uid, req.params.id);
    res.status(200).json(success(playlist, "Playlist fetched"));
  } catch (err: any) {
    next(err);
  }
};

export const createPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const playlist = await PlaylistService.createPlaylist(user.uid, req.body);
    res.status(201).json(success(playlist, "Playlist created successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const addPlaylistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const { contentId } = req.body;
    if (!contentId) {
      return next(new HttpError(400, "contentId is required"));
    }

    const item = await PlaylistService.addPlaylistItem(user.uid, req.params.id, contentId);
    res.status(201).json(success(item, "Content added to playlist"));
  } catch (err: any) {
    next(err);
  }
};

export const removePlaylistItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    await PlaylistService.removePlaylistItem(user.uid, req.params.id, req.params.contentId);
    res.status(200).json(success(null, "Content removed from playlist"));
  } catch (err: any) {
    next(err);
  }
};

export const deletePlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    await PlaylistService.deletePlaylist(user.uid, req.params.id);
    res.status(200).json(success(null, "Playlist deleted successfully"));
  } catch (err: any) {
    next(err);
  }
};

export const generateAIPlaylist = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user) return next(new HttpError(401, "Unauthorized"));

    const { topic } = req.body;
    if (!topic) {
      return next(new HttpError(400, "Topic parameter is required"));
    }

    const playlist = await PlaylistService.generateAIPlaylist(user.uid, topic);
    res.status(201).json(success(playlist, "AI playlist generated successfully"));
  } catch (err: any) {
    next(err);
  }
};
