import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Navigation, Save, X } from 'lucide-react';

interface Stop {
    id: number;
    name: string;
    description: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface MapStopPickerProps {
    isOpen: boolean;
    onClose: () => void;
    onStopSelected: (stop: Stop) => void;
    onCreateStop: (stopData: { name: string; description: string; latitude: number; longitude: number }) => Promise<Stop | undefined>;
    existingStops: Stop[];
    className?: string;
}

export function MapStopPicker({
    isOpen,
    onClose,
    onStopSelected,
    onCreateStop,
    existingStops,
    className
}: MapStopPickerProps) {
    const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [newStopName, setNewStopName] = useState('');
    const [newStopDescription, setNewStopDescription] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);
    const markerRef = useRef<google.maps.Marker | null>(null);

    useEffect(() => {
        if (isOpen && mapRef.current && !mapInstanceRef.current) {
            initializeMap();
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            getUserLocation();
        }
    }, [isOpen]);

    const getUserLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    setUserLocation(location);
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setCenter(location);
                        mapInstanceRef.current.setZoom(15);
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                    // Default to a central location (you can change this to your city)
                    const defaultLocation = { lat: 23.8103, lng: 90.4125 }; // Dhaka, Bangladesh
                    setUserLocation(defaultLocation);
                    if (mapInstanceRef.current) {
                        mapInstanceRef.current.setCenter(defaultLocation);
                    }
                }
            );
        }
    };

    const initializeMap = () => {
        if (!mapRef.current) return;

        const defaultCenter = userLocation || { lat: 23.8103, lng: 90.4125 };

        const map = new google.maps.Map(mapRef.current, {
            center: defaultCenter,
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
        });

        mapInstanceRef.current = map;

        // Add existing stops as markers
        existingStops.forEach(stop => {
            if (stop.latitude && stop.longitude) {
                const marker = new google.maps.Marker({
                    position: { lat: stop.latitude, lng: stop.longitude },
                    map: map,
                    title: stop.name,
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 8,
                        fillColor: '#3B82F6',
                        fillOpacity: 1,
                        strokeColor: '#1E40AF',
                        strokeWeight: 2,
                    }
                });

                const infoWindow = new google.maps.InfoWindow({
                    content: `
                        <div class="p-2">
                            <h3 class="font-semibold">${stop.name}</h3>
                            ${stop.description ? `<p class="text-sm text-gray-600">${stop.description}</p>` : ''}
                            <button onclick="window.selectExistingStop(${stop.id})"
                                class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600">
                                Select This Stop
                            </button>
                        </div>
                    `
                });

                marker.addListener('click', () => {
                    infoWindow.open(map, marker);
                });
            }
        });

        // Add click listener for creating new stops
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
                const position = {
                    lat: event.latLng.lat(),
                    lng: event.latLng.lng()
                };
                setSelectedPosition(position);
                setNewStopName('');
                setNewStopDescription('');

                // Remove previous marker
                if (markerRef.current) {
                    markerRef.current.setMap(null);
                }

                // Add new marker
                const marker = new google.maps.Marker({
                    position: position,
                    map: map,
                    title: 'New Stop Location',
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        scale: 10,
                        fillColor: '#EF4444',
                        fillOpacity: 1,
                        strokeColor: '#DC2626',
                        strokeWeight: 2,
                    }
                });

                markerRef.current = marker;
            }
        });

        // Global function to select existing stops
        (window as any).selectExistingStop = (stopId: number) => {
            const stop = existingStops.find(s => s.id === stopId);
            if (stop) {
                onStopSelected(stop);
                onClose();
            }
        };
    };

    const handleCreateNewStop = async () => {
        if (!selectedPosition || !newStopName.trim()) return;

        try {
            const newStop = await onCreateStop({
                name: newStopName.trim(),
                description: newStopDescription.trim(),
                latitude: selectedPosition.lat,
                longitude: selectedPosition.lng
            });

            if (newStop) {
                onStopSelected(newStop);
                onClose();
            }
        } catch (error) {
            console.error('Error creating stop:', error);
        }
    };

    const handleClose = () => {
        setSelectedPosition(null);
        setNewStopName('');
        setNewStopDescription('');
        if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl h-[80vh] flex flex-col">
                <CardHeader className="flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Select Stop Location
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={handleClose}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Click on existing blue markers to select stops, or click anywhere on the map to create a new stop
                    </div>
                </CardHeader>

                <CardContent className="flex-1 flex gap-4 min-h-0">
                    {/* Map */}
                    <div className="flex-1 relative">
                        <div ref={mapRef} className="w-full h-full rounded-lg" />
                        {userLocation && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                    if (mapInstanceRef.current && userLocation) {
                                        mapInstanceRef.current.setCenter(userLocation);
                                        mapInstanceRef.current.setZoom(15);
                                    }
                                }}
                            >
                                <Navigation className="h-4 w-4 mr-1" />
                                My Location
                            </Button>
                        )}
                    </div>

                    {/* New Stop Form */}
                    {selectedPosition && (
                        <div className="w-80 space-y-4">
                            <div className="p-4 border rounded-lg bg-muted/50">
                                <h3 className="font-semibold mb-3">Create New Stop</h3>
                                <div className="space-y-3">
                                    <div className="text-xs text-muted-foreground">
                                        Lat: {selectedPosition.lat.toFixed(6)}<br />
                                        Lng: {selectedPosition.lng.toFixed(6)}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Stop Name</Label>
                                        <Input
                                            value={newStopName}
                                            onChange={(e) => setNewStopName(e.target.value)}
                                            placeholder="Enter stop name..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Input
                                            value={newStopDescription}
                                            onChange={(e) => setNewStopDescription(e.target.value)}
                                            placeholder="Enter description (optional)..."
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={handleCreateNewStop}
                                            disabled={!newStopName.trim()}
                                            className="flex-1"
                                        >
                                            <Save className="h-4 w-4 mr-1" />
                                            Create & Select
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedPosition(null);
                                                if (markerRef.current) {
                                                    markerRef.current.setMap(null);
                                                }
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Note: This component requires Google Maps API to be loaded
// Add this script to your HTML head:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>
