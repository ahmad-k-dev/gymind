import { Linking, Platform } from 'react-native';
import type { MapPreference } from '../features/ui/ui.types';

export interface OpenMapsArgs {
  name?: string;
  address?: string;
  lat?: number;
  lng?: number;
  preference: MapPreference;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasValidCoords(args: Pick<OpenMapsArgs, 'lat' | 'lng'>): args is { lat: number; lng: number } {
  return isFiniteNumber(args.lat) && isFiniteNumber(args.lng);
}

function buildEncodedLabel({ name, address }: Pick<OpenMapsArgs, 'name' | 'address'>): string {
  const label = address?.trim() || name?.trim() || 'Gym';
  return encodeURIComponent(label);
}

function buildCoordinatesQuery(lat: number, lng: number): string {
  return `${lat},${lng}`;
}

export function buildShareableMapsUrl(args: Pick<OpenMapsArgs, 'name' | 'address' | 'lat' | 'lng'>): string {
  if (hasValidCoords(args)) {
    return `https://www.google.com/maps/search/?api=1&query=${buildCoordinatesQuery(args.lat, args.lng)}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${buildEncodedLabel(args)}`;
}

export async function canOpenGoogleMaps(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return Linking.canOpenURL('comgooglemaps://');
  }

  const canOpenGeo = await Linking.canOpenURL('geo:0,0?q=');
  if (canOpenGeo) return true;
  return Linking.canOpenURL('https://www.google.com/maps/search/?api=1&query=');
}

async function openSafe(primary: string, fallback?: string): Promise<boolean> {
  if (await Linking.canOpenURL(primary)) {
    await Linking.openURL(primary);
    return true;
  }

  if (fallback && (await Linking.canOpenURL(fallback))) {
    await Linking.openURL(fallback);
    return true;
  }

  return false;
}

async function openAppleMaps(args: OpenMapsArgs): Promise<void> {
  const url = hasValidCoords(args)
    ? `https://maps.apple.com/?q=${buildEncodedLabel(args)}&ll=${buildCoordinatesQuery(args.lat, args.lng)}`
    : `https://maps.apple.com/?q=${buildEncodedLabel(args)}`;
  const fallback = buildShareableMapsUrl(args);
  await openSafe(url, fallback);
}

async function openGoogleMaps(args: OpenMapsArgs): Promise<void> {
  const fallback = buildShareableMapsUrl(args);

  if (Platform.OS === 'ios') {
    const googleUrl = hasValidCoords(args)
      ? `comgooglemaps://?q=${buildEncodedLabel(args)}&center=${buildCoordinatesQuery(args.lat, args.lng)}`
      : `comgooglemaps://?q=${buildEncodedLabel(args)}`;
    await openSafe(googleUrl, fallback);
    return;
  }

  const geoUrl = hasValidCoords(args)
    ? `geo:${buildCoordinatesQuery(args.lat, args.lng)}?q=${buildCoordinatesQuery(args.lat, args.lng)}(${buildEncodedLabel(args)})`
    : `geo:0,0?q=${buildEncodedLabel(args)}`;
  await openSafe(geoUrl, fallback);
}

async function openDefaultMaps(args: OpenMapsArgs): Promise<void> {
  const url = buildShareableMapsUrl(args);
  await openSafe(url);
}

export async function openMaps(args: OpenMapsArgs): Promise<void> {
  if (args.preference === 'apple') {
    await openAppleMaps(args);
    return;
  }

  if (args.preference === 'google') {
    await openGoogleMaps(args);
    return;
  }

  await openDefaultMaps(args);
}

