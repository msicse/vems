import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Plus, Navigation, Search, X } from 'lucide-react';

// Fix for default markers in React-Leaflet
// @ts-expect-error - Leaflet marker icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for route stops
const stopIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icon for new stop location
const newStopIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
            <path fill="#ef4444" stroke="#dc2626" stroke-width="1" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 6.9 12.5 28.5 12.5 28.5S25 19.4 25 12.5C25 5.6 19.4 0 12.5 0z"/>
            <circle fill="#ffffff" cx="12.5" cy="12.5" r="4"/>
        </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

interface Stop {
    id: number;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
}

interface MapStopPickerProps {
    stops: Stop[];
    selectedStops: Array<{
        stop_id: number;
        order: number;
        stop?: Stop;
    }>;
    onStopSelect: (stop: Stop) => void;
    onCreateStop: (stopData: { name: string; address: string; latitude: number; longitude: number }) => void;
    className?: string;
}

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

export default function MapStopPicker({
    stops,
    selectedStops,
    onStopSelect,
    onCreateStop,
    className = ''
}: MapStopPickerProps) {
    const [isCreatingStop, setIsCreatingStop] = useState(false);
    const [newStopPosition, setNewStopPosition] = useState<{ lat: number; lng: number } | null>(null);
    const [newStopName, setNewStopName] = useState('');
    const [newStopAddress, setNewStopAddress] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Array<{
        display_name: string;
        lat: string;
        lon: string;
        place_id: string;
        type: 'geocoding';
    }>>([]);
    const [savedStopResults, setSavedStopResults] = useState<Stop[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const mapRef = useRef<L.Map | null>(null);
    const searchRef = useRef<HTMLDivElement>(null);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSearchResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Get user's current location
    const getCurrentLocation = useCallback(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                    if (mapRef.current) {
                        mapRef.current.setView([latitude, longitude], 13);
                    }
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        }
    }, []);

    // Search for locations using both saved stops and Nominatim geocoding
    const searchLocation = useCallback(async (query: string) => {
        if (!query.trim() || query.length < 2) {
            setSearchResults([]);
            setSavedStopResults([]);
            setShowSearchResults(false);
            return;
        }

        setIsSearching(true);
        try {
            // Search saved stops first
            const filteredStops = stops.filter(stop =>
                stop.name.toLowerCase().includes(query.toLowerCase()) ||
                stop.address.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5); // Limit to 5 results

            setSavedStopResults(filteredStops);

            // Search map locations (only if query is 3+ characters for better performance)
            let geocodingResults: Array<{
                display_name: string;
                lat: string;
                lon: string;
                place_id: string;
                type: 'geocoding';
            }> = [];
            if (query.length >= 3) {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&bounded=0`
                );

                if (response.ok) {
                    const rawResults = await response.json();
                    geocodingResults = rawResults.map((result: {
                        display_name: string;
                        lat: string;
                        lon: string;
                        place_id: string;
                    }) => ({
                        display_name: result.display_name,
                        lat: result.lat,
                        lon: result.lon,
                        place_id: result.place_id,
                        type: 'geocoding' as const
                    }));
                }
            }

            setSearchResults(geocodingResults);
            setShowSearchResults(filteredStops.length > 0 || geocodingResults.length > 0);
        } catch (error) {
            console.error('Error searching location:', error);
        } finally {
            setIsSearching(false);
        }
    }, [stops]);

    // Handle search with debouncing
    const handleSearchChange = useCallback((query: string) => {
        setSearchQuery(query);

        // Debounce search
        const timeoutId = setTimeout(() => {
            searchLocation(query);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchLocation]);

    // Handle selecting a search result
    const handleSearchResultSelect = (result: {
        display_name: string;
        lat: string;
        lon: string;
        place_id: string;
        type: 'geocoding';
    }) => {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);

        if (mapRef.current) {
            mapRef.current.setView([lat, lng], 15);
        }

        // Extract meaningful name from display_name
        const nameFromDisplay = result.display_name.split(',')[0].trim();

        // Create a new stop from the search result
        onCreateStop({
            name: nameFromDisplay,
            address: result.display_name,
            latitude: lat,
            longitude: lng
        });

        setShowSearchResults(false);
        setSearchQuery('');
    };

    // Handle selecting a saved stop
    const handleSavedStopSelect = (stop: Stop) => {
        if (stop.latitude !== null && stop.longitude !== null) {
            if (mapRef.current) {
                mapRef.current.setView([stop.latitude, stop.longitude], 15);
            }
        }

        // Also select this stop for the route
        onStopSelect(stop);

        setShowSearchResults(false);
        setSearchQuery('');
    };

    // Handle map click for creating new stop
    const handleMapClick = useCallback((lat: number, lng: number) => {
        if (isCreatingStop) {
            setNewStopPosition({ lat, lng });
            // Reverse geocoding could be implemented here to get address
            setNewStopAddress(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
        }
    }, [isCreatingStop]);

    // Handle stop creation
    const handleCreateStop = () => {
        if (newStopPosition && newStopName.trim()) {
            onCreateStop({
                name: newStopName.trim(),
                address: newStopAddress.trim() || `${newStopPosition.lat.toFixed(6)}, ${newStopPosition.lng.toFixed(6)}`,
                latitude: newStopPosition.lat,
                longitude: newStopPosition.lng
            });

            // Reset form
            setIsCreatingStop(false);
            setNewStopPosition(null);
            setNewStopName('');
            setNewStopAddress('');
        }
    };

    // Cancel stop creation
    const handleCancelCreation = () => {
        setIsCreatingStop(false);
        setNewStopPosition(null);
        setNewStopName('');
        setNewStopAddress('');
    };

    // Calculate default center based on existing stops
    const getMapCenter = (): [number, number] => {
        const validStops = stops.filter(stop => stop.latitude !== null && stop.longitude !== null);
        if (validStops.length === 0) {
            return [23.8103, 90.4125]; // Default to Dhaka, Bangladesh
        }

        const avgLat = validStops.reduce((sum, stop) => sum + (stop.latitude || 0), 0) / validStops.length;
        const avgLng = validStops.reduce((sum, stop) => sum + (stop.longitude || 0), 0) / validStops.length;
        return [avgLat, avgLng];
    };

    const isStopSelected = (stopId: number) => {
        return selectedStops.some(selected => selected.stop_id === stopId);
    };

    const getStopOrder = (stopId: number) => {
        const selected = selectedStops.find(selected => selected.stop_id === stopId);
        return selected?.order;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Controls */}
            <div className="flex gap-2 flex-wrap">
                <Button
                    type="button"
                    variant={isCreatingStop ? "destructive" : "outline"}
                    onClick={() => setIsCreatingStop(!isCreatingStop)}
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    {isCreatingStop ? 'Cancel Creation' : 'Create New Stop'}
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={getCurrentLocation}
                    className="flex items-center gap-2"
                >
                    <Navigation className="h-4 w-4" />
                    My Location
                </Button>
            </div>

            {/* Location Search */}
            <div className="relative z-[1100]" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search for a location..."
                        className="pl-10 pr-10"
                    />
                    {searchQuery && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSearchQuery('');
                                setSearchResults([]);
                                setSavedStopResults([]);
                                setShowSearchResults(false);
                            }}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>

                {/* Search Results */}
                {showSearchResults && (
                    <Card className="absolute z-[1200] w-full mt-1 shadow-lg border max-h-60 overflow-auto">
                        <CardContent className="p-0">
                            {/* Saved Stops Results */}
                            {savedStopResults.length > 0 && (
                                <>
                                    <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 border-b">
                                        Saved Stops
                                    </div>
                                    {savedStopResults.map((stop) => (
                                        <button
                                            key={`saved-${stop.id}`}
                                            onClick={() => handleSavedStopSelect(stop)}
                                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b last:border-b-0 flex items-start gap-3"
                                        >
                                            <MapPin className="h-4 w-4 mt-0.5 text-blue-600 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium truncate">
                                                    {stop.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {stop.address}
                                                </div>
                                            </div>
                                            {isStopSelected(stop.id) && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Selected
                                                </Badge>
                                            )}
                                        </button>
                                    ))}
                                </>
                            )}

                            {/* Map Locations Results */}
                            {searchResults.length > 0 && (
                                <>
                                    {savedStopResults.length > 0 && (
                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 border-b">
                                            Map Locations (Click to create stop)
                                        </div>
                                    )}
                                    {savedStopResults.length === 0 && (
                                        <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50 border-b">
                                            Map Locations (Click to create stop)
                                        </div>
                                    )}
                                    {searchResults.map((result) => (
                                        <button
                                            key={`geocoding-${result.place_id}`}
                                            onClick={() => handleSearchResultSelect(result)}
                                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b last:border-b-0 flex items-start gap-3"
                                        >
                                            <Plus className="h-4 w-4 mt-0.5 text-green-600 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium truncate">
                                                    {result.display_name.split(',')[0].trim()}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">
                                                    {result.display_name}
                                                </div>
                                                <div className="text-xs text-green-600 mt-1">
                                                    Click to create and add as stop
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </>
                            )}

                            {/* No Results */}
                            {savedStopResults.length === 0 && searchResults.length === 0 && (
                                <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                                    No locations found
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {isSearching && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2 z-[1300]">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    </div>
                )}
            </div>

            {/* Creation Mode Instructions */}
            {isCreatingStop && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            Create New Stop
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Click on the map to select the location for your new stop.
                        </p>

                        {newStopPosition && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium">Stop Name</label>
                                    <Input
                                        value={newStopName}
                                        onChange={(e) => setNewStopName(e.target.value)}
                                        placeholder="Enter stop name"
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium">Address</label>
                                    <Input
                                        value={newStopAddress}
                                        onChange={(e) => setNewStopAddress(e.target.value)}
                                        placeholder="Enter address (optional)"
                                        className="mt-1"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={handleCreateStop}
                                        disabled={!newStopName.trim()}
                                        className="flex-1"
                                    >
                                        Create Stop
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancelCreation}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Map */}
            <div className="h-96 rounded-lg overflow-hidden border">
                <MapContainer
                    center={getMapCenter()}
                    zoom={10}
                    className="h-full w-full"
                    ref={mapRef}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    {/* Handle map clicks for creating stops */}
                    <MapClickHandler onMapClick={handleMapClick} />

                    {/* Existing stops */}
                    {stops
                        .filter(stop => stop.latitude !== null && stop.longitude !== null)
                        .map(stop => (
                            <Marker
                                key={stop.id}
                                position={[stop.latitude!, stop.longitude!]}
                                icon={stopIcon}
                                eventHandlers={{
                                    click: () => {
                                        if (!isCreatingStop) {
                                            onStopSelect(stop);
                                        }
                                    }
                                }}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h3 className="font-semibold">{stop.name}</h3>
                                        <p className="text-sm text-gray-600">{stop.address}</p>
                                        {isStopSelected(stop.id) && (
                                            <Badge variant="secondary" className="mt-2">
                                                Order: {getStopOrder(stop.id)}
                                            </Badge>
                                        )}
                                        {!isCreatingStop && !isStopSelected(stop.id) && (
                                            <Button
                                                size="sm"
                                                className="mt-2 w-full"
                                                onClick={() => onStopSelect(stop)}
                                            >
                                                Add to Route
                                            </Button>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))
                    }

                    {/* New stop position */}
                    {newStopPosition && (
                        <Marker
                            position={[newStopPosition.lat, newStopPosition.lng]}
                            icon={newStopIcon}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-semibold text-red-600">New Stop Location</h3>
                                    <p className="text-sm text-gray-600">
                                        {newStopPosition.lat.toFixed(6)}, {newStopPosition.lng.toFixed(6)}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* User location */}
                    {userLocation && (
                        <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={new L.Icon({
                                iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
                                        <circle fill="#3b82f6" cx="10" cy="10" r="8" stroke="#ffffff" stroke-width="2"/>
                                        <circle fill="#ffffff" cx="10" cy="10" r="3"/>
                                    </svg>
                                `),
                                iconSize: [20, 20],
                                iconAnchor: [10, 10],
                            })}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-semibold text-blue-600">Your Location</h3>
                                </div>
                            </Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
