import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { QueueItem } from '@/hooks/use-pdf-queue';
import { MergeItem } from './merge-item';

interface MergeListProps {
  queue: QueueItem[];
  removeFile: (id: string) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
}

export function MergeList({ queue, removeFile, reorderQueue }: MergeListProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Prevents Next.js Server-Side Hydration mismatches by waiting for mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    reorderQueue(result.source.index, result.destination.index);
  };

  if (!isMounted) {
    // Show a static skeleton skeleton list during SSR/hydration to prevent layouts jumping
    return (
      <div className="flex flex-col gap-2">
        {queue.map((item, index) => (
          <div
            key={item.id}
            className="flex h-[62px] items-center justify-between border border-border bg-background/50 p-3 rounded-lg opacity-50"
          >
            <div className="size-4 bg-muted rounded shrink-0" />
            <div className="size-12 bg-muted rounded shrink-0 ml-3" />
            <div className="flex-1 ml-3 space-y-1">
              <div className="h-3 w-1/3 bg-muted rounded" />
              <div className="h-2 w-1/4 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="pdf-merge-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex flex-col gap-2.5 max-h-[420px] overflow-y-auto pr-1 select-none"
          >
            {queue.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(dragProvided) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    style={{
                      ...dragProvided.draggableProps.style,
                    }}
                  >
                    <MergeItem
                      item={item}
                      index={index}
                      removeFile={removeFile}
                      dragHandleProps={dragProvided.dragHandleProps}
                    />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
