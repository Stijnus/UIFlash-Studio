/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useEffect, useRef } from 'react';
import { Artifact } from '../types';
import { XIcon } from './Icons';

interface ArtifactCardProps {
    artifact: Artifact;
    isFocused: boolean;
    onClick: () => void;
    onClose?: (e: React.MouseEvent) => void;
}

const ArtifactCard = React.memo(({ 
    artifact, 
    isFocused, 
    onClick,
    onClose
}: ArtifactCardProps) => {
    const codeRef = useRef<HTMLPreElement>(null);

    // Auto-scroll logic for this specific card
    useEffect(() => {
        if (codeRef.current) {
            codeRef.current.scrollTop = codeRef.current.scrollHeight;
        }
    }, [artifact.html]);

    const isBlurring = artifact.status === 'streaming';

    return (
        <div 
            className={`artifact-card ${isFocused ? 'focused' : ''} ${isBlurring ? 'generating' : ''}`}
            onClick={onClick}
        >
            {isFocused && onClose && (
                <button 
                    className="artifact-close-button" 
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose(e);
                    }}
                    title="Close design"
                >
                    <XIcon />
                </button>
            )}
            <div className="artifact-header">
                <div className="artifact-meta">
                    <span className="artifact-style-tag">{artifact.styleName}</span>
                    {artifact.modelName && <span className="artifact-model-tag">{artifact.modelName}</span>}
                </div>
                {isBlurring && (
                    <div className="streaming-indicator">
                        <span className="dot"></span>
                        Streaming
                    </div>
                )}
            </div>
            <div className="artifact-card-inner">
                {isBlurring && (
                    <div className="generating-overlay">
                        <pre ref={codeRef} className="code-stream-preview">
                            {artifact.html}
                        </pre>
                    </div>
                )}
                <iframe 
                    srcDoc={artifact.html} 
                    title={artifact.id} 
                    sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-same-origin"
                    className="artifact-iframe"
                />
            </div>
        </div>
    );
});

export default ArtifactCard;