'use client';

import { useEffect, useState, useRef } from 'react';

interface Score {
  id: number;
  drill: string;
  drill_date: string | null;
  score: number;
  mistakes: number;
  total: number;
  average: number;
}

interface ScoreTableProps {
  title: string;
  endpoint: string;
  tableName: string;
  color1?: string;
  color2?: string;
}

export default function ScoreTable({ title, endpoint, tableName, color1, color2 }: ScoreTableProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRow, setNewRow] = useState({
    drill: '',
    drill_date: '',
    score: '',
    mistakes: '',
    total: ''
  });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [tableName]);

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket(`ws://blunchqt-1.onrender.com/ws/scores/${tableName}`);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setLoading(false);
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'initial':
            setScores(Array.isArray(message.data) ? message.data : []);
            setLoading(false);
            break;
          case 'insert':
            if (message.data && Array.isArray(message.data)) {
              setScores(prev => [...prev, ...message.data]);
            }
            break;
          case 'update':
            setScores(prev => prev.map(score => 
              score.id === message.id 
                ? { ...score, [message.field]: message.value }
                : score
            ));
            break;
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setLoading(false);
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
      
      wsRef.current = ws;
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
      // Fallback to HTTP if WebSocket fails
      fetchScores();
    }
  };

  async function fetchScores() {
    setLoading(true);
    try {
      const response = await fetch(`https://blunchqt-1.onrender.com/${endpoint}`);
      const data = await response.json();
      setScores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching scores:', error);
      setScores([]);
    } finally {
      setLoading(false);
    }
  }

  // Keep the HTTP fallback for compatibility
  useEffect(() => {
    // Only fetch via HTTP if WebSocket is not connected
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      const timer = setTimeout(() => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          fetchScores();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [endpoint]);

  const handleFieldChange = async (id: number, field: string, value: string | number) => {
    try {
      const response = await fetch('https://blunchqt-1.onrender.com/update_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          table: tableName,
          field, 
          value 
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error('Failed to update score');
      }
      
      // Update local state
      setScores(scores.map(s => {
        if (s.id === id) {
          const updatedScore = { ...s, [field]: field === 'date' ? value : Number(value) };
          
          // Recalculate average if numeric fields changed
          if (field === 'score' || field === 'mistakes' || field === 'total') {
            
            // Update average in database
            fetch('https://blunchqt-1.onrender.com/update_score', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                id, 
                table: tableName,
                field: 'average', 
              })
            });
          }
          
          return updatedScore;
        }
        return s;
      }));
    } catch (err) {
      console.error('Error updating score:', err);
      alert('Failed to update score. Make sure the server is running.');
    }
  };

  const handleAddRow = async () => {
   

    try {
      const score = Number(newRow.score);
      const mistakes = Number(newRow.mistakes);
      const total = Number(newRow.total);

      console.log('Sending data:', {
        table: tableName,
        drill: newRow.drill,
        drill_date: newRow.drill_date || null,
        score,
        mistakes,
        total
      });

      const response = await fetch('https://blunchqt-1.onrender.com/add_score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table: tableName,
          drill: newRow.drill,
          drill_date: newRow.drill_date || null,
          score,
          mistakes,
          total
        })
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok || responseData.error) {
        console.error('Server error:', responseData);
        throw new Error(responseData.error || 'Failed to add score');
      }

      // Reset form - WebSocket will handle adding to the list
      setNewRow({ drill: '', drill_date: '', score: '', mistakes: '', total: '' });
      
    } catch (err) {
      console.error('Error adding score:', err);
    }
  };

  return (
    <div 
      className="flex flex-col items-center font-sans min-h-screen md:p-8 overflow-x-hidden">
      <div className="w-full max-w-6xl">

        {loading ? (
          <p className="text-white text-center text-xl">Loading scores...</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: color1 || '#fbbc04' }}>
                  <th colSpan={6} className="px-4 md:px-6 py-3 md:py-4 text-center font-bold text-gray-800 text-lg md:text-xl">
                    {title}
                  </th>
                </tr>
                <tr style={{ backgroundColor: color2 || '#fff2cc' }}>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-left font-semibold text-gray-800 text-sm md:text-base">Drills</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Date</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Score</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Mistakes</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Total</th>
                  <th className="px-4 md:px-6 py-3 md:py-4 text-center font-semibold text-gray-800 text-sm md:text-base">Average</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((score, index) => (
                  <tr
                    key={score.id}
                    className={`border-b ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    } hover:bg-gray-100 transition-colors`}
                  >
                    <td className="px-4 md:px-6 py-3 md:py-4 text-gray-800 text-sm md:text-base">{score.drill}</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-600 text-sm md:text-base">
                      <input
                        type="date"
                        value={score.drill_date ? new Date(score.drill_date).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleFieldChange(score.id, 'drill_date', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-center text-sm"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-800 font-semibold text-sm md:text-base">
                      <input
                        type="number"
                        value={score.score}
                        onChange={(e) => handleFieldChange(score.id, 'score', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-center text-sm font-semibold"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-red-600 font-semibold text-sm md:text-base">
                      <input
                        type="number"
                        value={score.mistakes}
                        onChange={(e) => handleFieldChange(score.id, 'mistakes', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-center text-sm font-semibold text-red-600"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-gray-800 font-semibold text-sm md:text-base">
                      <input
                        type="number"
                        value={score.total}
                        onChange={(e) => handleFieldChange(score.id, 'total', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8A3D58] text-center text-sm font-semibold"
                      />
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center text-green-600 font-semibold text-sm md:text-base">
                      {typeof score.average === 'number' ? score.average.toFixed(2) : Number(score.average).toFixed(2)}%
                    </td>
                  </tr>
                ))}
                
                {/* New Row for Adding Data */}
                <tr className=" border-t-2">
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <input
                      type="text"
                      placeholder="Enter drill name"
                      value={newRow.drill}
                      onChange={(e) => setNewRow({ ...newRow, drill: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <input
                      type="date"
                      value={newRow.drill_date}
                      onChange={(e) => setNewRow({ ...newRow, drill_date: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <input
                      type="number"
                      placeholder="Score"
                      value={newRow.score}
                      onChange={(e) => setNewRow({ ...newRow, score: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <input
                      type="number"
                      placeholder="Mistakes"
                      value={newRow.mistakes}
                      onChange={(e) => setNewRow({ ...newRow, mistakes: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <input
                      type="number"
                      placeholder="Total"
                      value={newRow.total}
                      onChange={(e) => setNewRow({ ...newRow, total: e.target.value })}
                      className="text-black w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-sm"
                    />
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                    <button
                      onClick={handleAddRow}
                      className="px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-semibold"
                    >
                      Add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            
            {scores.length === 0 && (
              <p className="text-center py-8 text-gray-500">No scores found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
