import { useRef, useState, useEffect } from 'react';
import './App.css';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

function App() {
  const canvasRef = useRef(null);
  const courtImageRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('red');
  const [isEraser, setIsEraser] = useState(false);
  const [lineStyle, setLineStyle] = useState('solid'); // 'solid' or 'dashed'
  const [strokes, setStrokes] = useState([]);
  const [currentStroke, setCurrentStroke] = useState([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [twoFingerEraser, setTwoFingerEraser] = useState(false); // Track if erasing with 2 fingers
  const previousModeRef = useRef({ color: 'red', lineStyle: 'solid' }); // Store previous mode
  
  // Player markers
  const [markers, setMarkers] = useState([]); // Array of {number, x, y, hasBall: boolean, screen: {x1, y1, x2, y2} | null, team: 'team'|'opponent'}
  const [selectedMarker, setSelectedMarker] = useState(1); // Which marker number to place (1-5)
  const [selectedTeam, setSelectedTeam] = useState('team'); // 'team' or 'opponent'
  const [draggingMarker, setDraggingMarker] = useState(null); // Index of marker being dragged
  const [markerMode, setMarkerMode] = useState(false); // Toggle marker placement mode
  const [lastTapTime, setLastTapTime] = useState(0); // For double-tap detection
  const [lastTappedMarker, setLastTappedMarker] = useState(null); // Track which marker was tapped
  const [longPressTimer, setLongPressTimer] = useState(null); // For long-press detection
  const [screenSettingMode, setScreenSettingMode] = useState(null); // {markerIndex, startX, startY} when setting screen
  const [screenDragStart, setScreenDragStart] = useState(null); // Starting position for screen drag
  const [lastClearTime, setLastClearTime] = useState(0); // For double-press clear detection
  
  // Universal action history for UNDO
  const [actionHistory, setActionHistory] = useState([]); // Array of {type, data}
  
  // Removed court rotation feature
  // Court background toggle state
  const [useHorizontalCourt, setUseHorizontalCourt] = useState(false);
  
  // Marker movement paths
  const [markerPaths, setMarkerPaths] = useState([]); // Array of {markerNumber, points: [{x,y}], hasBall: boolean}
  const [dragStartPosition, setDragStartPosition] = useState(null); // Track where drag started
  const [currentDragPath, setCurrentDragPath] = useState([]); // Track all points during drag
  
  // Pass lines (dotted lines for ball passes)
  const [passLines, setPassLines] = useState([]); // Array of {from: {x,y}, to: {x,y}}
  
  // Ball animation
  const [ballAnimation, setBallAnimation] = useState(null); // {from: {x, y}, to: {x, y}, progress: 0-1}
  const animationRef = useRef(null);
  
  // Video recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const streamRef = useRef(null); // Track the recording stream
  
  // Saved plays
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [savedPlays, setSavedPlays] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('General');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  
  // Collection navigation (when a collection is loaded)
  const [activeCollection, setActiveCollection] = useState(null); // Currently loaded collection name
  const [activeCollectionPlays, setActiveCollectionPlays] = useState([]); // Cached sorted plays array
  const [activePlayIndex, setActivePlayIndex] = useState(0); // Current play index in collection
  
  // Notes panel
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesContent, setNotesContent] = useState('');
  const notesTextareaRef = useRef(null);

  // Load court image
  useEffect(() => {
    setImageLoaded(false); // Reset to trigger redraw when new image loads
    const img = new Image();
    const imagePath = useHorizontalCourt ? '/court-background-horizontal.png' : '/court-background.png';
    img.src = imagePath;
    img.onload = () => {
      courtImageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load court image:', imagePath);
      alert(`Court image not found: ${imagePath}\nPlease add the file to the public folder.`);
      // Fallback to default court
      if (useHorizontalCourt) {
        setUseHorizontalCourt(false); // Switch back to default
      }
    };
  }, [useHorizontalCourt]);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('coach-notes');
    if (savedNotes) {
      setNotesContent(savedNotes);
    }
  }, []);

  // Load saved plays from localStorage on mount
  useEffect(() => {
    const plays = localStorage.getItem('saved-plays');
    if (plays) {
      try {
        setSavedPlays(JSON.parse(plays));
      } catch (e) {
        console.error('Error loading saved plays:', e);
      }
    }
  }, []);

  // Auto-save notes to localStorage when content changes
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      localStorage.setItem('coach-notes', notesContent);
    }, 300); // Debounce 300ms
    
    return () => clearTimeout(saveTimeout);
  }, [notesContent]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && imageLoaded) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        drawCourt();
        redrawStrokes();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [imageLoaded, strokes, markers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded) return;

    // Set canvas size to window size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw court with image background
    drawCourt();
    
    // Redraw all strokes
    redrawStrokes();
  }, [strokes, markers, markerPaths, passLines, imageLoaded]);

  // Cleanup ball animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const drawCourt = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = courtImageRef.current;
    
    if (!img) return;
    
    // Fill canvas with wood color background
    ctx.fillStyle = '#D4A574';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // PORTRAIT MODE ONLY: Normal orientation (no rotation)
    
    // Calculate scaling to fit image while maintaining aspect ratio
    const imgAspect = img.width / img.height;
    const canvasAspect = canvas.width / canvas.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
      // Image is wider than canvas - fit to width
      drawWidth = canvas.width;
      drawHeight = canvas.width / imgAspect;
      drawX = 0;
      drawY = (canvas.height - drawHeight) / 2;
    } else {
      // Image is taller than canvas - fit to height
      drawHeight = canvas.height;
      drawWidth = canvas.height * imgAspect;
      drawX = (canvas.width - drawWidth) / 2;
      drawY = 0;
    }
    
    // Draw the court image centered and scaled
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
  };

  const drawMarkers = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // First, draw pass lines (dotted lines for passes)
    passLines.forEach(pass => {
      ctx.save();
      ctx.strokeStyle = '#333'; // Dark grey for passes
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 6]); // Dotted line for passes
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(pass.from.x, pass.from.y);
      ctx.lineTo(pass.to.x, pass.to.y);
      ctx.stroke();
      
      ctx.restore();
    });
    
    // Then draw marker movement paths
    markerPaths.forEach(path => {
      if (!path.points || path.points.length < 2) return;
      
      ctx.save();
      ctx.strokeStyle = '#333'; // Dark grey for movement (was #BDBDBD)
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (path.hasBall) {
        // WAVY line for dribbling (player with ball)
        ctx.setLineDash([]);
        ctx.beginPath();
        
        const waveAmplitude = 6; // Height of wave
        const waveFrequency = 20; // Distance between waves
        let totalDistance = 0;
        
        // Calculate total path length
        const distances = [];
        for (let i = 0; i < path.points.length - 1; i++) {
          const dx = path.points[i + 1].x - path.points[i].x;
          const dy = path.points[i + 1].y - path.points[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          distances.push(dist);
          totalDistance += dist;
        }
        
        // Draw smooth wave along the path
        let accumulatedDist = 0;
        
        for (let i = 0; i < path.points.length - 1; i++) {
          const p1 = path.points[i];
          const p2 = path.points[i + 1];
          const segmentDist = distances[i];
          
          if (segmentDist < 1) continue;
          
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          
          // Perpendicular vector (for wave offset)
          const nx = -dy / segmentDist;
          const ny = dx / segmentDist;
          
          // Draw wave along this segment
          const steps = Math.max(5, Math.floor(segmentDist / 2));
          
          for (let step = 0; step <= steps; step++) {
            const t = step / steps;
            const x = p1.x + dx * t;
            const y = p1.y + dy * t;
            
            // Calculate wave offset based on distance along total path
            const distAlongPath = accumulatedDist + segmentDist * t;
            const wavePhase = (distAlongPath / waveFrequency) * Math.PI * 2;
            const waveOffset = Math.sin(wavePhase) * waveAmplitude;
            
            const finalX = x + nx * waveOffset;
            const finalY = y + ny * waveOffset;
            
            if (i === 0 && step === 0) {
              ctx.moveTo(finalX, finalY);
            } else {
              ctx.lineTo(finalX, finalY);
            }
          }
          
          accumulatedDist += segmentDist;
        }
        
        ctx.stroke();
        
      } else {
        // STRAIGHT line for movement without ball (running, no dribbling)
        ctx.setLineDash([]);
        ctx.beginPath();
        path.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
      }
      
      ctx.restore();
    });
    
    // Draw screens for markers that have them
    markers.forEach(marker => {
      if (marker.screen) {
        ctx.save();
        ctx.strokeStyle = '#333'; // Dark grey for screen
        ctx.lineWidth = 6; // Thick line
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(marker.screen.x1, marker.screen.y1);
        ctx.lineTo(marker.screen.x2, marker.screen.y2);
        ctx.stroke();
        
        ctx.restore();
      }
    });
    
    // Finally draw each player marker (on top of everything)
    markers.forEach(marker => {
      const radius = 25;
      const isOpponent = marker.team === 'opponent';
      
      // Draw circle
      ctx.beginPath();
      ctx.arc(marker.x, marker.y, radius, 0, Math.PI * 2);
      
      if (marker.hasBall) {
        ctx.fillStyle = 'rgba(255, 152, 0, 0.95)'; // Orange for ball possession (both teams)
      } else if (isOpponent) {
        ctx.fillStyle = 'rgba(43, 45, 66, 0.95)'; // Dark charcoal for opponents
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // White for team
      }
      ctx.fill();
      ctx.strokeStyle = isOpponent ? '#1a1b28' : '#000';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Draw number - white text if has ball or opponent, black if team without ball
      ctx.fillStyle = (marker.hasBall || isOpponent) ? '#fff' : '#000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(marker.number, marker.x, marker.y);
    });
  };

  const drawBasketball = (x, y, size = 18) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Use basketball emoji 🏀 (bigger!)
    ctx.save();
    ctx.font = `${size * 2.2}px Arial`; // Bigger emoji (was 2x, now 2.2x)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏀', x, y);
    ctx.restore();
  };

  const redrawStrokes = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // First, draw a clean court background
    drawCourt();
    
    // Create an off-screen canvas for drawings only
    const drawingCanvas = document.createElement('canvas');
    drawingCanvas.width = canvas.width;
    drawingCanvas.height = canvas.height;
    const drawingCtx = drawingCanvas.getContext('2d');
    
    // Draw all strokes (including eraser) on the drawing canvas
    strokes.forEach(stroke => {
      if (stroke.isEraser) {
        // Use destination-out to erase on the drawing layer
        drawingCtx.globalCompositeOperation = 'destination-out';
        drawingCtx.strokeStyle = 'rgba(0,0,0,1)';
        drawingCtx.lineWidth = 35; // IMPROVED: Larger eraser for easier erasing
        drawingCtx.setLineDash([]); // Eraser always solid
      } else {
        // Draw normally
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.strokeStyle = stroke.color;
        drawingCtx.lineWidth = 4;
        
        // Apply line style
        if (stroke.lineStyle === 'dashed') {
          drawingCtx.setLineDash([10, 10]); // 10px dash, 10px gap
        } else {
          drawingCtx.setLineDash([]); // Solid line
        }
      }
      
      drawingCtx.lineCap = 'round';
      drawingCtx.lineJoin = 'round';
      
      drawingCtx.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) {
          drawingCtx.moveTo(point.x, point.y);
        } else {
          drawingCtx.lineTo(point.x, point.y);
        }
      });
      drawingCtx.stroke();
    });
    
    // Now draw the drawing canvas on top of the court background
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(drawingCanvas, 0, 0);
    
    // Draw player markers on top of everything
    drawMarkers();
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    setCurrentStroke([{ x, y }]);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newPoint = { x, y };
    const updatedStroke = [...currentStroke, newPoint];
    setCurrentStroke(updatedStroke);
    
    // Redraw everything including the current stroke in progress
    const ctx = canvas.getContext('2d');
    
    // First, draw court background
    drawCourt();
    
    // Create an off-screen canvas for all drawings
    const drawingCanvas = document.createElement('canvas');
    drawingCanvas.width = canvas.width;
    drawingCanvas.height = canvas.height;
    const drawingCtx = drawingCanvas.getContext('2d');
    
    // Draw all saved strokes
    strokes.forEach(stroke => {
      if (stroke.isEraser) {
        drawingCtx.globalCompositeOperation = 'destination-out';
        drawingCtx.strokeStyle = 'rgba(0,0,0,1)';
        drawingCtx.lineWidth = 35; // IMPROVED: Larger eraser
        drawingCtx.setLineDash([]); // Eraser always solid
      } else {
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.strokeStyle = stroke.color;
        drawingCtx.lineWidth = 4;
        
        // Apply line style
        if (stroke.lineStyle === 'dashed') {
          drawingCtx.setLineDash([10, 10]);
        } else {
          drawingCtx.setLineDash([]);
        }
      }
      
      drawingCtx.lineCap = 'round';
      drawingCtx.lineJoin = 'round';
      
      drawingCtx.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) {
          drawingCtx.moveTo(point.x, point.y);
        } else {
          drawingCtx.lineTo(point.x, point.y);
        }
      });
      drawingCtx.stroke();
    });
    
    // Draw the current stroke in progress
    if (updatedStroke.length > 1) {
      if (isEraser) {
        drawingCtx.globalCompositeOperation = 'destination-out';
        drawingCtx.strokeStyle = 'rgba(0,0,0,1)';
        drawingCtx.lineWidth = 35; // IMPROVED: Larger eraser
        drawingCtx.setLineDash([]);
      } else {
        drawingCtx.globalCompositeOperation = 'source-over';
        drawingCtx.strokeStyle = color;
        drawingCtx.lineWidth = 4;
        
        // Apply current line style
        if (lineStyle === 'dashed') {
          drawingCtx.setLineDash([10, 10]);
        } else {
          drawingCtx.setLineDash([]);
        }
      }
      
      drawingCtx.lineCap = 'round';
      drawingCtx.lineJoin = 'round';
      
      drawingCtx.beginPath();
      updatedStroke.forEach((point, index) => {
        if (index === 0) {
          drawingCtx.moveTo(point.x, point.y);
        } else {
          drawingCtx.lineTo(point.x, point.y);
        }
      });
      drawingCtx.stroke();
    }
    
    // Composite the drawing layer on top of the background
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(drawingCanvas, 0, 0);
    
    // Draw player markers on top
    drawMarkers();
  };

  const stopDrawing = () => {
    if (isDrawing && currentStroke.length > 0) {
      // Save the stroke with its line style
      const newStroke = {
        points: currentStroke,
        color: color,
        isEraser: isEraser,
        lineStyle: lineStyle
      };
      setStrokes([...strokes, newStroke]);
      
      // Record to history
      recordAction('DRAW_STROKE', newStroke);
    }
    setIsDrawing(false);
    setCurrentStroke([]);
  };

  // Record action to history for universal UNDO
  const recordAction = (type, data) => {
    setActionHistory([...actionHistory, { type, data }]);
  };

  const handleUndo = () => {
    if (actionHistory.length === 0) return;
    
    // Get last action
    const lastAction = actionHistory[actionHistory.length - 1];
    
    // Reverse the action based on type
    switch (lastAction.type) {
      case 'DRAW_STROKE':
        // Remove last drawing stroke
        setStrokes(prevStrokes => prevStrokes.slice(0, -1));
        break;
        
      case 'PLACE_PLAYER':
        // Remove the placed player (match by number AND team)
        setMarkers(prevMarkers => prevMarkers.filter(m => 
          !(m.number === lastAction.data.number && m.team === lastAction.data.team)
        ));
        break;
        
      case 'MOVE_PLAYER':
        // Restore player to previous position and remove path
        setMarkers(prevMarkers => prevMarkers.map(m => 
          (m.number === lastAction.data.number && m.team === lastAction.data.team)
            ? { ...m, x: lastAction.data.prevX, y: lastAction.data.prevY }
            : m
        ));
        setMarkerPaths(prevPaths => prevPaths.filter(p => 
          !(p.markerNumber === lastAction.data.number && p.markerTeam === lastAction.data.team)
        ));
        break;
        
      case 'PASS_BALL':
        // Restore ball possession to previous player
        setMarkers(prevMarkers => prevMarkers.map((m, idx) => ({
          ...m,
          hasBall: idx === lastAction.data.fromIndex
        })));
        setPassLines([]); // Remove pass line
        break;
        
      case 'SET_SCREEN':
        // Remove screen from player
        setMarkers(prevMarkers => prevMarkers.map(m =>
          (m.number === lastAction.data.number && m.team === lastAction.data.team)
            ? { ...m, screen: null }
            : m
        ));
        break;
        
      default:
        break;
    }
    
    // Remove action from history
    setActionHistory(prevHistory => prevHistory.slice(0, -1));
  };

  const handleClear = () => {
    if (markerMode) {
      // In player mode: smart clear
      const currentTime = Date.now();
      const timeSinceLastClear = currentTime - lastClearTime;
      
      // Double-press detection (within 500ms)
      if (timeSinceLastClear < 500) {
        // SECOND PRESS - Clear everything including players
        setStrokes([]);
        setMarkers([]);
        setMarkerPaths([]);
        setPassLines([]);
        setLastClearTime(0); // Reset
        drawCourt();
      } else {
        // FIRST PRESS - Clear tracks only, keep players
        setMarkerPaths([]); // Remove movement paths
        setPassLines([]); // Remove pass lines
        setLastClearTime(currentTime);
        drawCourt();
      }
    } else {
      // In draw mode: clear everything
      setStrokes([]);
      setMarkers([]);
      setMarkerPaths([]);
      setPassLines([]);
      drawCourt();
    }
  };

  const handleColorChange = (newColor) => {
    setColor(newColor);
    setIsEraser(false);
  };

  const handleEraserToggle = () => {
    setIsEraser(!isEraser);
  };

  const handleLineStyleToggle = () => {
    setLineStyle(lineStyle === 'solid' ? 'dashed' : 'solid');
  };

  // Save current play
  const savePlay = () => {
    const collectionToUse = isCreatingCollection && newCollectionName.trim() 
      ? newCollectionName.trim() 
      : selectedCollection;
    
    const play = {
      id: Date.now(),
      collection: collectionToUse,
      createdAt: new Date().toISOString(),
      data: {
        markers: markers,
        markerPaths: markerPaths,
        passLines: passLines,
        strokes: strokes
      }
    };
    
    const updatedPlays = [...savedPlays, play];
    setSavedPlays(updatedPlays);
    localStorage.setItem('saved-plays', JSON.stringify(updatedPlays));
    
    // Reset modal state
    setSelectedCollection(collectionToUse); // Remember last used collection
    setNewCollectionName('');
    setIsCreatingCollection(false);
    setShowSaveModal(false);
  };

  // Get unique collections from saved plays
  const getCollections = () => {
    const collections = new Set(['General']); // Always have General
    savedPlays.forEach(play => {
      if (play.collection) {
        collections.add(play.collection);
      }
    });
    return Array.from(collections).sort();
  };

  // Get plays in a specific collection (sorted by creation date)
  const getPlaysInCollection = (collection) => {
    return savedPlays
      .filter(play => (play.collection || 'General') === collection)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.id || 0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.id || 0);
        return dateA - dateB;
      });
  };

  // Load a collection (starts at first play)
  const loadCollection = (collection) => {
    const plays = getPlaysInCollection(collection);
    if (plays.length === 0) return;
    
    // Close modal first to prevent any rendering interference
    setShowLoadModal(false);
    
    // Then cache the plays array and load the first play
    setActiveCollectionPlays(plays);
    setActiveCollection(collection);
    setActivePlayIndex(0);
    loadPlayData(plays[0]);
  };

  // Load play data onto the canvas
  const loadPlayData = (play) => {
    setStrokes(play.data.strokes || []);
    setMarkers(play.data.markers || []);
    setMarkerPaths(play.data.markerPaths || []);
    setPassLines(play.data.passLines || []);
    setActionHistory([]);
    // Note: redrawing is handled by useEffect that watches these state changes
  };

  // Navigate to next play in collection
  const nextPlay = () => {
    if (!activeCollection || activeCollectionPlays.length === 0) return;
    if (activePlayIndex < activeCollectionPlays.length - 1) {
      const newIndex = activePlayIndex + 1;
      setActivePlayIndex(newIndex);
      loadPlayData(activeCollectionPlays[newIndex]);
    }
  };

  // Navigate to previous play in collection
  const prevPlay = () => {
    if (!activeCollection || activeCollectionPlays.length === 0) return;
    if (activePlayIndex > 0) {
      const newIndex = activePlayIndex - 1;
      setActivePlayIndex(newIndex);
      loadPlayData(activeCollectionPlays[newIndex]);
    }
  };

  // Close collection navigation
  const closeCollection = () => {
    setActiveCollection(null);
    setActiveCollectionPlays([]);
    setActivePlayIndex(0);
  };

  // Delete a collection and all its plays
  const deleteCollection = (collection) => {
    const playsInCollection = getPlaysInCollection(collection);
    if (!window.confirm(`Delete "${collection}" and all ${playsInCollection.length} plays in it?`)) return;
    
    const updatedPlays = savedPlays.filter(p => (p.collection || 'General') !== collection);
    setSavedPlays(updatedPlays);
    localStorage.setItem('saved-plays', JSON.stringify(updatedPlays));
    
    // If we deleted the active collection, close navigation
    if (activeCollection === collection) {
      closeCollection();
    }
  };

  // Delete a saved play
  const deletePlay = (playId) => {
    if (!window.confirm('Delete this play?')) return;
    
    const updatedPlays = savedPlays.filter(p => p.id !== playId);
    setSavedPlays(updatedPlays);
    localStorage.setItem('saved-plays', JSON.stringify(updatedPlays));
    
    // If in active collection, update the cached array and adjust index
    if (activeCollection) {
      const remainingPlays = updatedPlays
        .filter(p => (p.collection || 'General') === activeCollection)
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(a.id || 0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(b.id || 0);
          return dateA - dateB;
        });
      
      if (remainingPlays.length === 0) {
        closeCollection();
      } else {
        setActiveCollectionPlays(remainingPlays);
        // Adjust index if we deleted the last play
        const newIndex = Math.min(activePlayIndex, remainingPlays.length - 1);
        setActivePlayIndex(newIndex);
        // Load the play at new index
        loadPlayData(remainingPlays[newIndex]);
      }
    }
  };

  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // FORCE RESET - Clean up any previous recording state
      if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
        } catch (e) {
          // Ignore errors stopping old recorder
        }
        mediaRecorderRef.current = null;
      }
      
      // Clean up any previous stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Reset state
      recordedChunksRef.current = [];
      setIsRecording(false);
      
      // Capture canvas stream at 60 FPS for smooth, high-quality video
      const stream = canvas.captureStream(60); // 60 FPS
      streamRef.current = stream; // Store for cleanup later
      
      // Try different formats in order of preference
      let mediaRecorder = null;
      let recordingFormat = 'webm'; // Default
      let mimeType = 'video/webm';
      
      // List of formats to try (in order of preference)
      // NOTE: MP4 removed because canvas.captureStream() MP4 recording fails even when "supported"
      const formatOptions = [
        { mime: 'video/webm;codecs=vp9', format: 'webm', name: 'WebM VP9' },
        { mime: 'video/webm;codecs=vp8', format: 'webm', name: 'WebM VP8' },
        { mime: 'video/webm', format: 'webm', name: 'WebM' }
      ];
      
      // Find first supported format
      for (const option of formatOptions) {
        if (MediaRecorder.isTypeSupported(option.mime)) {
          try {
            mediaRecorder = new MediaRecorder(stream, {
              mimeType: option.mime,
              videoBitsPerSecond: 8000000 // 8 Mbps
            });
            recordingFormat = option.format;
            mimeType = option.mime;
            console.log(`Recording as ${option.name} (${option.mime})`);
            break; // Found working format!
          } catch (e) {
            console.log(`${option.name} supported but failed to create:`, e);
            continue; // Try next option
          }
        }
      }
      
      // If no format worked, try default
      if (!mediaRecorder) {
        console.log('Using default MediaRecorder settings');
        mediaRecorder = new MediaRecorder(stream, {
          videoBitsPerSecond: 8000000
        });
        recordingFormat = 'webm';
        mimeType = 'video/webm';
      }
      
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        try {
          const blob = new Blob(recordedChunksRef.current, {
            type: mimeType
          });
          
          const fileSizeMB = (blob.size / 1024 / 1024).toFixed(2);
          const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
          const filename = `statspro-play-${timestamp}.${recordingFormat}`;
          
          // Check if running in native app (Android)
          const isNativeApp = Capacitor.isNativePlatform();
          
          if (isNativeApp) {
            // Use Capacitor Filesystem for native app
            await saveVideoNative(blob, filename, fileSizeMB, mimeType);
          } else {
            // Use browser download for web
            await saveVideoWeb(blob, filename, fileSizeMB, mimeType);
          }
        } catch (error) {
          console.error('Error in onstop handler:', error);
          // Don't alert here - save functions handle their own errors
        } finally {
          // ALWAYS clean up, even if save was cancelled or failed
          recordedChunksRef.current = [];
          mediaRecorderRef.current = null; // Clear the reference
          
          // Stop all tracks on the stream to release resources
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
          
          // Make sure states are reset
          if (isRecording) {
            setIsRecording(false);
          }
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        alert('❌ Recording error occurred.\n\nPlease try again.');
        
        // Clean up everything
        recordedChunksRef.current = [];
        mediaRecorderRef.current = null;
        
        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        setIsRecording(false);
        
        // Redraw canvas with paths
        setTimeout(() => {
          drawCourt();
          redrawStrokes();
        }, 50);
      };
      
      // Start recording
      try {
        mediaRecorder.start(1000); // Collect data every second
        
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        
      } catch (startError) {
        console.error('Error starting MediaRecorder:', startError);
        alert('❌ Could not start recording.\n\nPlease try again.');
        
        // Clean up on error
        recordedChunksRef.current = [];
        mediaRecorderRef.current = null;
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        throw startError;
      }
      
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('❌ Could not start recording.\n\nYour browser may not support this feature.');
    }
  };

  const saveVideoNative = async (blob, filename, fileSizeMB, mimeType) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      await new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Data = reader.result.split(',')[1]; // Remove data prefix
            
            // Save to Documents directory (visible to user)
            const result = await Filesystem.writeFile({
              path: filename,
              data: base64Data,
              directory: Directory.Documents,
              recursive: true
            });
            
            alert(`✅ Video saved!\n\nFilename: ${filename}\nSize: ${fileSizeMB} MB\n\nLocation: Documents folder\n\nOpen Files app to find it!`);
            
            // Try to share the file
            try {
              await Share.share({
                title: 'StatsPro Play Recording',
                text: `Play recording (${fileSizeMB} MB)`,
                url: result.uri,
                dialogTitle: 'Share your play recording'
              });
            } catch (shareError) {
              // Sharing cancelled or not available, file is still saved
              console.log('Share cancelled or not available');
            }
            
            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
      });
      
    } catch (error) {
      console.error('Error saving video (native):', error);
      alert(`❌ Error saving video:\n\n${error.message}\n\nVideo was not saved.`);
    }
  };

  const saveVideoWeb = async (blob, filename, fileSizeMB, mimeType) => {
    // Try to share on mobile web first
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], filename, { type: mimeType })] })) {
      try {
        const file = new File([blob], filename, { type: mimeType });
        await navigator.share({
          files: [file],
          title: 'StatsPro Play Recording',
          text: `Play recording (${fileSizeMB} MB)`
        });
        alert(`✅ Video saved!\nSize: ${fileSizeMB} MB\nYou can share it now!`);
      } catch (error) {
        if (error.name !== 'AbortError') {
          // If sharing fails, try download
          downloadVideo(blob, filename, fileSizeMB);
        }
      }
    } else {
      // Desktop or browsers without share API - use download
      downloadVideo(blob, filename, fileSizeMB);
    }
  };

  const downloadVideo = (blob, filename, fileSizeMB) => {
    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = filename;
    
    document.body.appendChild(a);
    a.click();
    
    // Show success message
    setTimeout(() => {
      alert(`✅ Video saved!\n\nFilename: ${filename}\nSize: ${fileSizeMB} MB\n\nCheck your Downloads folder!`);
    }, 500);
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
        // Stream cleanup will happen in onstop handler's finally block
      } catch (error) {
        console.error('Error stopping MediaRecorder:', error);
        // Clean up anyway
        mediaRecorderRef.current = null;
        
        // Stop stream tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
      setIsRecording(false);
      
      // Redraw canvas
      setTimeout(() => {
        drawCourt();
        redrawStrokes();
      }, 50);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const passBallToMarker = (markerIndex) => {
    // Find current ball holder
    const currentBallHolder = markers.findIndex(m => m.hasBall);
    
    if (currentBallHolder === -1) {
      // No one has ball, just give it to this player
      const newMarkers = markers.map((marker, index) => ({
        ...marker,
        hasBall: index === markerIndex
      }));
      setMarkers(newMarkers);
      redrawStrokes();
    } else if (currentBallHolder !== markerIndex) {
      // Record the pass line (dotted line from passer to receiver)
      // Only keep the LAST pass (replace any previous pass)
      const fromMarker = markers[currentBallHolder];
      const toMarker = markers[markerIndex];
      
      const newPassLine = {
        from: { x: fromMarker.x, y: fromMarker.y },
        to: { x: toMarker.x, y: toMarker.y }
      };
      
      // Replace entire array with just this new pass (only last pass shown)
      setPassLines([newPassLine]);
      
      // Record pass to history
      recordAction('PASS_BALL', {
        fromIndex: currentBallHolder,
        toIndex: markerIndex
      });
      
      // Animate ball from current holder to new holder
      animateBallPass(fromMarker, toMarker, () => {
        // After animation completes, update markers
        const newMarkers = markers.map((marker, index) => ({
          ...marker,
          hasBall: index === markerIndex
        }));
        setMarkers(newMarkers);
      });
    }
    // If clicking same player, do nothing
  };

  const animateBallPass = (from, to, onComplete) => {
    const startTime = Date.now();
    const duration = 350; // Faster for straight line (was 600ms)
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Linear easing for straight line - no deceleration
      const eased = progress;
      
      // STRAIGHT LINE - no arc
      const x = from.x + (to.x - from.x) * eased;
      const y = from.y + (to.y - from.y) * eased;
      
      // Redraw everything
      redrawStrokes();
      
      // Draw the basketball emoji in flight (bigger!)
      drawBasketball(x, y, 18);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete
        animationRef.current = null;
        if (onComplete) onComplete();
        redrawStrokes();
      }
    };
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animate();
  };

  const handleMarkerDoubleClick = (e) => {
    if (!markerMode) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if double-clicking on an existing marker
    const markerRadius = 25;
    const clickedMarkerIndex = markers.findIndex(marker => {
      const distance = Math.sqrt(Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2));
      return distance <= markerRadius;
    });
    
    if (clickedMarkerIndex !== -1) {
      // Pass ball to this marker
      passBallToMarker(clickedMarkerIndex);
    }
  };

  const handleMarkerTouch = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if touching an existing marker
    const markerRadius = 25;
    const touchedMarkerIndex = markers.findIndex(marker => {
      const distance = Math.sqrt(Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2));
      return distance <= markerRadius;
    });
    
    if (touchedMarkerIndex !== -1) {
      // Touching an existing marker - check for double-tap
      const currentTime = Date.now();
      const timeSinceLastTap = currentTime - lastTapTime;
      
      // Double-tap detection (within 300ms on same marker)
      if (timeSinceLastTap < 300 && lastTappedMarker === touchedMarkerIndex) {
        // DOUBLE TAP - Pass ball to this marker!
        passBallToMarker(touchedMarkerIndex);
        setLastTapTime(0); // Reset to prevent triple-tap issues
        setLastTappedMarker(null);
      } else {
        // Single tap - prepare for drag or potential double-tap or long-press
        setLastTapTime(currentTime);
        setLastTappedMarker(touchedMarkerIndex);
        setDraggingMarker(touchedMarkerIndex);
        
        // Check if marker has a screen
        const marker = markers[touchedMarkerIndex];
        const hadScreen = marker.screen !== null && marker.screen !== undefined;
        
        // REMOVE SCREEN IMMEDIATELY when touching player with screen
        if (hadScreen) {
          const newMarkersNoScreen = markers.map((m, idx) => {
            if (idx === touchedMarkerIndex) {
              return { ...m, screen: null };
            }
            return m;
          });
          setMarkers(newMarkersNoScreen);
          
          // Force immediate redraw
          requestAnimationFrame(() => {
            const canvas = canvasRef.current;
            if (canvas) {
              drawCourt();
              redrawStrokes();
            }
          });
        }
        
        // Record starting position for movement path
        const startPos = { x: marker.x, y: marker.y };
        setDragStartPosition({ ...startPos, hasBall: marker.hasBall }); // Track if has ball
        // Start recording the path
        setCurrentDragPath([startPos]);
        
        // Store starting position for screen drag detection
        setScreenDragStart({ x, y });
        
        // Only start long-press timer if marker didn't have a screen
        // (If it had a screen, we just removed it, don't set a new one)
        if (!hadScreen) {
          // Start long-press timer (500ms) for screen setting
          const timer = setTimeout(() => {
            // Long-press completed - enter screen setting mode
            setScreenSettingMode({
              markerIndex: touchedMarkerIndex,
              startX: x,
              startY: y
            });
          }, 500);
          
          setLongPressTimer(timer);
        }
      }
    } else {
      // Tapping on empty space - place new marker ONLY if it doesn't already exist
      
      // Check if this number+team combo already exists
      const existingMarkerIndex = markers.findIndex(m => m.number === selectedMarker && m.team === selectedTeam);
      
      if (existingMarkerIndex === -1) {
        // Marker doesn't exist - place new marker
        const ctx = canvas.getContext('2d');
        const radius = 25;
        const isOpponent = selectedTeam === 'opponent';
        
        // Draw the marker immediately with correct team color
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = isOpponent ? 'rgba(43, 45, 66, 0.95)' : 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.strokeStyle = isOpponent ? '#1a1b28' : '#000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw number with correct color
        ctx.fillStyle = isOpponent ? '#fff' : '#000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(selectedMarker, x, y);
        
        // Then update state
        const newMarkers = [...markers, { number: selectedMarker, x, y, hasBall: false, screen: null, team: selectedTeam }];
        setMarkers(newMarkers);
        recordAction('PLACE_PLAYER', { number: selectedMarker, x, y, team: selectedTeam });
      }
      // If marker already exists, do nothing (don't relocate it)
      
      // Reset double-tap tracking
      setLastTapTime(0);
      setLastTappedMarker(null);
    }
  };

  const handleMarkerDrag = (e) => {
    if (draggingMarker === null) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Check if we're in screen setting mode (after long-press completed)
    if (screenSettingMode) {
      // In screen setting mode - just track position, don't move marker
      return;
    }
    
    // Check if user has moved enough to cancel long-press (for normal drag)
    if (longPressTimer && screenDragStart) {
      const dx = x - screenDragStart.x;
      const dy = y - screenDragStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If moved more than 10px, this is a normal drag, cancel long-press
      if (distance > 10) {
        clearTimeout(longPressTimer);
        setLongPressTimer(null);
        setScreenDragStart(null);
      }
    }
    
    // Normal marker dragging
    // Add this point to the drag path
    setCurrentDragPath(prev => [...prev, { x, y }]);
    
    // Update marker position
    const newMarkers = [...markers];
    newMarkers[draggingMarker] = { ...newMarkers[draggingMarker], x, y };
    setMarkers(newMarkers);
    redrawStrokes();
  };

  // Smooth and simplify path by removing redundant points and averaging
  const smoothPath = (points) => {
    if (!points || points.length < 3) return points;
    
    // Step 1: More aggressive simplification - remove points closer than 15px (was 10px)
    const simplified = [points[0]]; // Always keep first point
    for (let i = 1; i < points.length; i++) {
      const lastPoint = simplified[simplified.length - 1];
      const currentPoint = points[i];
      const distance = Math.sqrt(
        Math.pow(currentPoint.x - lastPoint.x, 2) + 
        Math.pow(currentPoint.y - lastPoint.y, 2)
      );
      
      // More aggressive - keep points at least 15px apart (was 10px)
      if (distance >= 15) {
        simplified.push(currentPoint);
      }
    }
    // Always keep last point if different
    const lastOriginal = points[points.length - 1];
    const lastSimplified = simplified[simplified.length - 1];
    if (lastOriginal.x !== lastSimplified.x || lastOriginal.y !== lastSimplified.y) {
      simplified.push(lastOriginal);
    }
    
    if (simplified.length < 3) return simplified;
    
    // Step 2: Apply Catmull-Rom spline with MORE interpolation points
    const smoothed = [];
    
    // Add first point
    smoothed.push(simplified[0]);
    
    // For each segment between control points
    for (let i = 0; i < simplified.length - 1; i++) {
      // Get 4 control points (with padding for edges)
      const p0 = i === 0 ? simplified[0] : simplified[i - 1];
      const p1 = simplified[i];
      const p2 = simplified[i + 1];
      const p3 = i + 2 < simplified.length ? simplified[i + 2] : simplified[i + 1];
      
      // Increased interpolation points for silkier curves (was 10, now 15)
      const numPoints = 15;
      
      // Catmull-Rom interpolation between p1 and p2
      for (let t = 0; t <= numPoints; t++) {
        const u = t / numPoints;
        const u2 = u * u;
        const u3 = u2 * u;
        
        // Catmull-Rom basis functions (tension = 0.5 for balanced curves)
        const b0 = -0.5 * u3 + u2 - 0.5 * u;
        const b1 = 1.5 * u3 - 2.5 * u2 + 1;
        const b2 = -1.5 * u3 + 2 * u2 + 0.5 * u;
        const b3 = 0.5 * u3 - 0.5 * u2;
        
        // Calculate interpolated point
        const x = b0 * p0.x + b1 * p1.x + b2 * p2.x + b3 * p3.x;
        const y = b0 * p0.y + b1 * p1.y + b2 * p2.y + b3 * p3.y;
        
        // Skip if too close to last point
        if (smoothed.length > 0) {
          const last = smoothed[smoothed.length - 1];
          const dist = Math.sqrt(Math.pow(x - last.x, 2) + Math.pow(y - last.y, 2));
          if (dist < 2) continue;
        }
        
        smoothed.push({ x, y });
      }
    }
    
    // Ensure last point is exactly the end point
    smoothed.push(simplified[simplified.length - 1]);
    
    // Step 3: Additional smoothing pass - moving average for extra silkiness
    if (smoothed.length < 5) return smoothed;
    
    const extraSmooth = [smoothed[0], smoothed[1]]; // Keep first two points
    
    for (let i = 2; i < smoothed.length - 2; i++) {
      const p0 = smoothed[i - 2];
      const p1 = smoothed[i - 1];
      const p2 = smoothed[i];
      const p3 = smoothed[i + 1];
      const p4 = smoothed[i + 2];
      
      // 5-point weighted average for extra smooth
      extraSmooth.push({
        x: (p0.x + p1.x * 2 + p2.x * 3 + p3.x * 2 + p4.x) / 9,
        y: (p0.y + p1.y * 2 + p2.y * 3 + p3.y * 2 + p4.y) / 9
      });
    }
    
    // Keep last two points
    extraSmooth.push(smoothed[smoothed.length - 2]);
    extraSmooth.push(smoothed[smoothed.length - 1]);
    
    return extraSmooth;
  };

  const handleMarkerTouchEnd = (e) => {
    // Clear any pending long-press timer
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    
    // Check if we're in screen setting mode
    if (screenSettingMode && e && e.changedTouches && e.changedTouches[0]) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const touch = e.changedTouches[0];
      const endX = touch.clientX - rect.left;
      const endY = touch.clientY - rect.top;
      
      const startX = screenSettingMode.startX;
      const startY = screenSettingMode.startY;
      
      // Calculate drag direction
      const dx = endX - startX;
      const dy = endY - startY;
      const dragDistance = Math.sqrt(dx * dx + dy * dy);
      
      // Only set screen if user dragged at least 20px
      if (dragDistance >= 20) {
        const marker = markers[screenSettingMode.markerIndex];
        
        // Normalize direction vector
        const dirX = dx / dragDistance;
        const dirY = dy / dragDistance;
        
        // Calculate perpendicular vector (rotate 90 degrees)
        const perpX = -dirY;
        const perpY = dirX;
        
        // Bar length = player diameter (50px)
        const barLength = 50;
        const halfBar = barLength / 2;
        
        // Position bar in the direction of drag
        // Offset from player center
        const offsetDistance = 35; // 25 (radius) + 10 (gap)
        const centerX = marker.x + dirX * offsetDistance;
        const centerY = marker.y + dirY * offsetDistance;
        
        // Calculate bar endpoints (perpendicular to drag direction)
        const screen = {
          x1: centerX + perpX * halfBar,
          y1: centerY + perpY * halfBar,
          x2: centerX - perpX * halfBar,
          y2: centerY - perpY * halfBar
        };
        
        // Update marker with screen (remove any existing screen first)
        const newMarkers = markers.map((m, idx) => {
          if (idx === screenSettingMode.markerIndex) {
            return { ...m, screen };
          }
          return m;
        });
        
        setMarkers(newMarkers);
        
        // Record screen setting to history
        recordAction('SET_SCREEN', {
          number: marker.number,
          team: marker.team,
          screen: screen
        });
        
        redrawStrokes();
      }
      
      // Clear screen setting mode and all related state
      setScreenSettingMode(null);
      setScreenDragStart(null);
      setDraggingMarker(null);
      setDragStartPosition(null);
      setCurrentDragPath([]);
      return;
    }
    
    // If screenSettingMode was somehow set but event missing, clear it
    if (screenSettingMode) {
      setScreenSettingMode(null);
      setScreenDragStart(null);
      setDraggingMarker(null);
      setDragStartPosition(null);
      setCurrentDragPath([]);
      return;
    }
    
    // Normal drag end (not screen setting)
    // If we were dragging and have recorded path points, save the movement path
    if (draggingMarker !== null && currentDragPath.length > 1 && dragStartPosition) {
      const marker = markers[draggingMarker];
      const startPos = currentDragPath[0];
      const endPos = currentDragPath[currentDragPath.length - 1];
      
      // Calculate distance moved
      const distance = Math.sqrt(
        Math.pow(endPos.x - startPos.x, 2) + 
        Math.pow(endPos.y - startPos.y, 2)
      );
      
      // Only record path if marker moved at least 10px (avoids recording tiny accidental moves)
      if (distance >= 10) {
        // Remove any existing path for this player number AND team
        const newPaths = markerPaths.filter(p => 
          !(p.markerNumber === marker.number && p.markerTeam === marker.team)
        );
        
        // Smooth the path to remove jitter
        const smoothedPath = smoothPath(currentDragPath);
        
        // Add new path for this player with smoothed points and ball status
        newPaths.push({
          markerNumber: marker.number,
          markerTeam: marker.team,
          points: smoothedPath,
          hasBall: dragStartPosition.hasBall // Whether player had ball during this movement
        });
        
        setMarkerPaths(newPaths);
        
        // Record player movement to history
        recordAction('MOVE_PLAYER', {
          number: marker.number,
          team: marker.team,
          prevX: dragStartPosition.x,
          prevY: dragStartPosition.y,
          newX: marker.x,
          newY: marker.y
        });
        
        // Remove pass lines when any player moves
        setPassLines([]);
        
        redrawStrokes();
      }
    }
    
    // Always clear these at the end
    setDraggingMarker(null);
    setDragStartPosition(null);
    setCurrentDragPath([]);
    setScreenDragStart(null);
  };

  // Mouse handlers for marker mode (PC/Desktop support)
  const handleMarkerMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if clicking on an existing marker
    const markerRadius = 25;
    const clickedMarkerIndex = markers.findIndex(marker => {
      const distance = Math.sqrt(Math.pow(marker.x - x, 2) + Math.pow(marker.y - y, 2));
      return distance <= markerRadius;
    });
    
    if (clickedMarkerIndex !== -1) {
      // Clicking on an existing marker - start drag
      setDraggingMarker(clickedMarkerIndex);
      
      const marker = markers[clickedMarkerIndex];
      
      // Check if marker has a screen - remove it
      if (marker.screen) {
        const newMarkersNoScreen = markers.map((m, idx) => {
          if (idx === clickedMarkerIndex) {
            return { ...m, screen: null };
          }
          return m;
        });
        setMarkers(newMarkersNoScreen);
      }
      
      // Record starting position for movement path
      const startPos = { x: marker.x, y: marker.y };
      setDragStartPosition({ ...startPos, hasBall: marker.hasBall });
      setCurrentDragPath([startPos]);
    } else {
      // Clicking on empty space - place new marker ONLY if it doesn't already exist
      
      // Check if this number+team combo already exists
      const existingMarkerIndex = markers.findIndex(m => m.number === selectedMarker && m.team === selectedTeam);
      
      if (existingMarkerIndex === -1) {
        // Marker doesn't exist - add new marker
        const newMarkers = [...markers, { number: selectedMarker, x, y, hasBall: false, screen: null, team: selectedTeam }];
        setMarkers(newMarkers);
        recordAction('PLACE_PLAYER', { number: selectedMarker, x, y, team: selectedTeam });
      }
      // If marker already exists, do nothing (don't relocate it)
    }
  };

  const handleMarkerMouseMove = (e) => {
    if (draggingMarker === null) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add point to drag path
    setCurrentDragPath(prev => [...prev, { x, y }]);
    
    // Update marker position
    const newMarkers = [...markers];
    newMarkers[draggingMarker] = { ...newMarkers[draggingMarker], x, y };
    setMarkers(newMarkers);
    redrawStrokes();
  };

  const handleMarkerMouseUp = (e) => {
    if (draggingMarker === null) return;
    
    const marker = markers[draggingMarker];
    
    // Check if marker was actually moved
    if (dragStartPosition && currentDragPath.length > 1) {
      const startPos = dragStartPosition;
      const endPos = { x: marker.x, y: marker.y };
      const distance = Math.sqrt(
        Math.pow(endPos.x - startPos.x, 2) + 
        Math.pow(endPos.y - startPos.y, 2)
      );
      
      // Only record path if moved at least 10px
      if (distance >= 10) {
        const newPaths = markerPaths.filter(p => 
          !(p.markerNumber === marker.number && p.markerTeam === marker.team)
        );
        
        const smoothedPath = smoothPath(currentDragPath);
        
        newPaths.push({
          markerNumber: marker.number,
          markerTeam: marker.team,
          points: smoothedPath,
          hasBall: dragStartPosition.hasBall
        });
        
        setMarkerPaths(newPaths);
        
        recordAction('MOVE_PLAYER', {
          number: marker.number,
          team: marker.team,
          prevX: dragStartPosition.x,
          prevY: dragStartPosition.y,
          newX: marker.x,
          newY: marker.y
        });
        
        setPassLines([]);
        redrawStrokes();
      }
    }
    
    // Clear drag state
    setDraggingMarker(null);
    setDragStartPosition(null);
    setCurrentDragPath([]);
  };

  return (
    <div className="App">
      <div 
        className="version-display"
        onClick={() => setUseHorizontalCourt(!useHorizontalCourt)}
        title={useHorizontalCourt ? "Switch to vertical court" : "Switch to horizontal court"}
        style={{ cursor: 'pointer' }}
      >
        <div>v2.8.0</div>
        <div>Allan C.</div>
      </div>
      
      {isRecording && (
        <div className="recording-indicator">
          <span className="recording-dot"></span>
          <span className="recording-text">REC</span>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => {
          // If in marker mode, handle marker placement/dragging
          if (markerMode) {
            handleMarkerMouseDown(e);
            return;
          }
          startDrawing(e);
        }}
        onMouseMove={(e) => {
          // If dragging a marker with mouse, handle it
          if (markerMode && draggingMarker !== null) {
            handleMarkerMouseMove(e);
            return;
          }
          draw(e);
        }}
        onMouseUp={(e) => {
          // If in marker mode and was dragging
          if (markerMode && draggingMarker !== null) {
            handleMarkerMouseUp(e);
            return;
          }
          stopDrawing();
        }}
        onMouseLeave={stopDrawing}
        onDoubleClick={handleMarkerDoubleClick}
        onTouchStart={(e) => {
          e.preventDefault();
          
          // If in marker mode, handle marker placement/dragging
          if (markerMode) {
            handleMarkerTouch(e);
            return;
          }
          
          // Check if two or more fingers are touching
          if (e.touches.length >= 2) {
            // Save current mode if not already erasing
            if (!isEraser) {
              previousModeRef.current = { color, lineStyle };
            }
            // Enable eraser mode
            setIsEraser(true);
            setTwoFingerEraser(true);
            
            // Start drawing with first touch point
            const touch = e.touches[0];
            startDrawing(touch);
          } else {
            // Single finger - normal drawing
            // If we were doing two-finger erasing, restore previous mode
            if (twoFingerEraser) {
              setIsEraser(false);
              setTwoFingerEraser(false);
            }
            const touch = e.touches[0];
            startDrawing(touch);
          }
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          
          // If dragging a marker, handle marker drag
          if (markerMode && draggingMarker !== null) {
            handleMarkerDrag(e);
            return;
          }
          
          // Check if still using two fingers
          if (e.touches.length >= 2 && !twoFingerEraser) {
            // Just switched to two fingers mid-stroke
            if (!isEraser) {
              previousModeRef.current = { color, lineStyle };
            }
            setIsEraser(true);
            setTwoFingerEraser(true);
          } else if (e.touches.length === 1 && twoFingerEraser) {
            // Just went back to one finger mid-stroke
            setIsEraser(false);
            setTwoFingerEraser(false);
          }
          
          const touch = e.touches[0];
          draw(touch);
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          
          // Handle marker drag end
          if (markerMode && draggingMarker !== null) {
            handleMarkerTouchEnd(e);
            return;
          }
          
          stopDrawing();
          
          // If no more touches and we were two-finger erasing, restore mode
          if (e.touches.length === 0 && twoFingerEraser) {
            setIsEraser(false);
            setTwoFingerEraser(false);
          }
        }}
      />
      
      <div className="top-controls">
        <button 
          className={`marker-mode-btn ${markerMode ? 'active' : ''}`}
          onClick={() => setMarkerMode(!markerMode)}
          title="Toggle players mode"
        >
          <span className="btn-icon">👥</span>
          <span className="btn-label">{markerMode ? '✓ Players' : 'Players'}</span>
        </button>
        
        <button 
          className={`record-btn ${isRecording ? 'recording' : ''}`}
          onClick={toggleRecording}
          title={isRecording ? "Stop recording" : "Start recording video"}
        >
          <span className="btn-icon">{isRecording ? '⏹️' : '⏺️'}</span>
          <span className="btn-label">{isRecording ? 'Stop' : 'Record'}</span>
        </button>
        
        <button 
          className={`notes-btn ${notesOpen ? 'active' : ''}`}
          onClick={() => {
            setNotesOpen(!notesOpen);
            // Focus textarea when opening
            if (!notesOpen && notesTextareaRef.current) {
              setTimeout(() => notesTextareaRef.current.focus(), 100);
            }
          }}
          title={notesOpen ? "Close notes" : "Open notes"}
        >
          <span className="btn-icon">📋</span>
          <span className="btn-label">{notesOpen ? 'Close' : 'Notes'}</span>
        </button>
        
        {markerMode && (
          <div className="marker-numbers">
            <div className="team-toggle">
              <button
                className={`team-toggle-btn ${selectedTeam === 'team' ? 'active' : ''}`}
                onClick={() => setSelectedTeam('team')}
                title="Place your team's players"
              >
                <span className="team-marker team">○</span>
                <span>Team</span>
              </button>
              <button
                className={`team-toggle-btn opponent ${selectedTeam === 'opponent' ? 'active' : ''}`}
                onClick={() => setSelectedTeam('opponent')}
                title="Place opponent players"
              >
                <span className="team-marker opp">●</span>
                <span>Opp</span>
              </button>
            </div>
            {[1, 2, 3, 4, 5].map(num => (
              <button
                key={num}
                className={`marker-num-btn ${selectedMarker === num ? 'active' : ''} ${selectedTeam === 'opponent' ? 'opponent' : ''}`}
                onClick={() => setSelectedMarker(num)}
              >
                {num}
              </button>
            ))}
            <div className="marker-help">
              Double-tap to pass ball
            </div>
          </div>
        )}
      </div>
      
      <div className="controls">
        {/* All buttons on one line */}
        <button 
          className={`color-btn ${color}`}
          onClick={() => handleColorChange(color === 'red' ? 'black' : 'red')}
          title={`Drawing in ${color} - tap to switch`}
        >
          <span className="btn-icon">{color === 'red' ? '🔴' : '⚫'}</span>
          <span className="btn-label">{color === 'red' ? 'Red' : 'Black'}</span>
        </button>
        
        <button 
          className={`line-style-btn ${!isEraser ? 'active' : ''}`}
          onClick={handleLineStyleToggle}
          title={`Line style: ${lineStyle} - tap to switch`}
        >
          <span className="btn-icon">{lineStyle === 'solid' ? '━━━' : '╌╌╌'}</span>
          <span className="btn-label">{lineStyle === 'solid' ? 'Solid' : 'Dash'}</span>
        </button>
        
        <button 
          className={`eraser-btn ${isEraser ? 'active' : ''}`}
          onClick={handleEraserToggle}
          title="Erase drawings"
        >
          <span className="btn-icon">🧹</span>
          <span className="btn-label">Erase</span>
        </button>
        
        {/* Separator */}
        <div className="button-group-separator"></div>
        
        <button 
          className="undo-btn"
          onClick={handleUndo}
          title="Undo last action"
        >
          <span className="btn-icon">↩️</span>
          <span className="btn-label">Undo</span>
        </button>
        
        <button 
          className="clear-btn"
          onClick={handleClear}
          title={markerMode ? "Clear tracks (press twice for all)" : "Clear everything"}
        >
          <span className="btn-icon">🗑️</span>
          <span className="btn-label">Clear</span>
        </button>
        
        {/* Separator */}
        <div className="button-group-separator"></div>
        
        <button 
          className="save-btn"
          onClick={() => setShowSaveModal(true)}
          title="Save this play"
        >
          <span className="btn-icon">💾</span>
          <span className="btn-label">Save</span>
        </button>
        
        <button 
          className="load-btn"
          onClick={() => setShowLoadModal(true)}
          title="Load a saved play"
        >
          <span className="btn-icon">📂</span>
          <span className="btn-label">Load</span>
        </button>
      </div>
      
      {/* Notes Panel */}
      {notesOpen && (
        <div className="notes-panel open">
          <div className="notes-content">
            <div className="notes-header">
              <span className="notes-title">📋 Coach Notes</span>
              <span className="notes-hint">Auto-saves • Persists between sessions</span>
            </div>
            <textarea
              ref={notesTextareaRef}
              className="notes-textarea"
              value={notesContent}
              onChange={(e) => setNotesContent(e.target.value)}
              placeholder="Reminders for timeout or pre-game...

• Defensive rotation on pick & roll
• Push tempo after made baskets
• Box out #23"
            />
            <button 
              className="notes-clear-btn"
              onClick={() => {
                if (window.confirm('Clear all notes?')) {
                  setNotesContent('');
                }
              }}
            >
              Clear Notes
            </button>
          </div>
        </div>
      )}
      
      {/* Save Play Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => { setShowSaveModal(false); setIsCreatingCollection(false); setNewCollectionName(''); }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>💾 Save Play</h2>
              <button className="modal-close" onClick={() => { setShowSaveModal(false); setIsCreatingCollection(false); setNewCollectionName(''); }}>✕</button>
            </div>
            <div className="modal-body">
              <label htmlFor="play-collection">Save to collection:</label>
              {!isCreatingCollection ? (
                <div className="collection-selector">
                  <select
                    id="play-collection"
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                  >
                    {getCollections().map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                  <button 
                    className="new-collection-btn"
                    onClick={() => setIsCreatingCollection(true)}
                    title="Create new collection"
                  >
                    + New
                  </button>
                </div>
              ) : (
                <div className="collection-selector">
                  <input
                    type="text"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    placeholder="e.g. Offense, SLOB, Press Break"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newCollectionName.trim()) savePlay();
                    }}
                  />
                  <button 
                    className="cancel-new-collection-btn"
                    onClick={() => { setIsCreatingCollection(false); setNewCollectionName(''); }}
                  >
                    Cancel
                  </button>
                </div>
              )}
              <p className="save-hint">Play will be added as Play #{getPlaysInCollection(isCreatingCollection && newCollectionName.trim() ? newCollectionName.trim() : selectedCollection).length + 1}</p>
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => { setShowSaveModal(false); setIsCreatingCollection(false); setNewCollectionName(''); }}>Cancel</button>
              <button className="modal-btn save" onClick={savePlay}>Save</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Load Collection Modal */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📂 Playbook</h2>
              <button className="modal-close" onClick={() => setShowLoadModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {savedPlays.length === 0 ? (
                <div className="no-plays">
                  <p>No saved plays yet.</p>
                  <p className="hint">Create a play and tap Save to build your playbook!</p>
                </div>
              ) : (
                <div className="collections-list">
                  {getCollections().map((collection) => {
                    const playsCount = getPlaysInCollection(collection).length;
                    if (playsCount === 0) return null;
                    return (
                      <div key={collection} className="collection-item" onClick={() => loadCollection(collection)}>
                        <div className="collection-info">
                          <span className="collection-icon">📁</span>
                          <span className="collection-name">{collection}</span>
                          <span className="collection-count">{playsCount} play{playsCount !== 1 ? 's' : ''}</span>
                        </div>
                        <button 
                          className="collection-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteCollection(collection);
                          }}
                          title="Delete collection"
                        >
                          🗑️
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="modal-btn cancel" onClick={() => setShowLoadModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Collection Navigation Bar */}
      {activeCollection && activeCollectionPlays.length > 0 && (
        <div className="collection-nav">
          <button 
            className="nav-close"
            onClick={closeCollection}
            title="Close collection"
          >
            ✕
          </button>
          <button 
            className={`nav-arrow ${activePlayIndex === 0 ? 'disabled' : ''}`}
            onClick={prevPlay}
            disabled={activePlayIndex === 0}
          >
            ←
          </button>
          <div className="nav-info">
            <span className="nav-collection">{activeCollection}</span>
            <span className="nav-position">Play {activePlayIndex + 1} / {activeCollectionPlays.length}</span>
          </div>
          <button 
            className={`nav-arrow ${activePlayIndex >= activeCollectionPlays.length - 1 ? 'disabled' : ''}`}
            onClick={nextPlay}
            disabled={activePlayIndex >= activeCollectionPlays.length - 1}
          >
            →
          </button>
          <button 
            className="nav-delete"
            onClick={() => {
              if (activeCollectionPlays[activePlayIndex]) {
                deletePlay(activeCollectionPlays[activePlayIndex].id);
              }
            }}
            title="Delete this play"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
