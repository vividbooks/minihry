import { motion } from 'motion/react';
import { BallRed } from './BallRed';
import { BallBlue } from './BallBlue';
import svgPathsGreen from '../imports/svg-tb3rqzyu48';
import svgPathsPurple from '../imports/svg-12op5dzpm4';
import Group17794 from '../imports/Group17794';

interface FloorTileProps {
  isOccupied: boolean;
  isElevator: boolean;
  isElevatorDown: boolean;
  isElevatorAnimating?: boolean;
  hasHeart: boolean;
  heartCollected?: boolean;
  isWinnerCelebrating?: boolean;
  ballColor?: string;
  ballColors?: string[];
  ballDirections?: ('left' | 'right')[];
  ballSize?: string;
  elevatorDrop?: number;
  floorColor: 'green' | 'purple' | 'orange';
  onClick?: () => void;
}

export function FloorTile({ 
  isOccupied, 
  isElevator, 
  isElevatorDown,
  isElevatorAnimating = false,
  hasHeart,
  heartCollected = false,
  isWinnerCelebrating = false,
  ballColor,
  ballColors,
  ballDirections = [],
  ballSize = 'w-16 h-16 md:w-20 md:h-20',
  elevatorDrop = 234,
  floorColor,
  onClick
}: FloorTileProps) {
  
  // Barvy pro různá patra
  const getColors = () => {
    switch(floorColor) {
      case 'green':
        return {
          topFill: '#ACFFE0',
          bottomFill: '#7CEBC2',
          stroke: '#5FC29D'
        };
      case 'purple':
        return {
          topFill: '#A495FF',
          bottomFill: '#7863FF',
          stroke: '#1800AE'
        };
      case 'orange':
        return {
          topFill: '#FFD4A3',
          bottomFill: '#FFB870',
          stroke: '#FF8C00'
        };
    }
  };

  const colors = getColors();
  const svgPaths = floorColor === 'purple' ? svgPathsPurple : svgPathsGreen;

  return (
    <motion.div 
      className="relative w-full h-full cursor-pointer"
      onClick={onClick}
      style={{
        zIndex: isElevatorAnimating ? 20 : 'auto'
      }}
      animate={{
        y: isElevatorAnimating ? elevatorDrop : (isOccupied ? 9 : 0)
      }}
      transition={{ 
        duration: isElevatorAnimating ? 1.2 : 0.2,
        ease: isElevatorAnimating ? "easeInOut" : "easeOut"
      }}
    >
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 46 40">
        <g clipPath="url(#clip0_tile)" id="Group_tile">
          <path 
            d={svgPaths.p2be7c140} 
            fill={colors.topFill} 
            id="Rectangle_top" 
            stroke={colors.stroke} 
            strokeWidth="2" 
          />
          <path 
            d={svgPaths.p6b9f7c0} 
            fill={colors.bottomFill} 
            id="Rectangle_bottom" 
            stroke={colors.stroke} 
            strokeWidth="2" 
          />
          <path 
            d="M4.61206 5.22705V18.7383" 
            id="Vector_line" 
            stroke="white" 
            strokeLinecap="round" 
            strokeOpacity="0.5" 
            strokeWidth="3" 
          />
        </g>
        <defs>
          <clipPath id="clip0_tile">
            <rect fill="white" height="39.749" width="45.4273" />
          </clipPath>
        </defs>
      </svg>

      {/* Kulička/kuličky na políčku */}
      {isOccupied && ballColors && ballColors.length > 1 ? (
        // Obě kuličky na stejném políčku - překrývají se s offsetem
        <div className="absolute top-[30%] left-[35%]" style={{ transform: 'translate(-50%, calc(-50% - 30px))' }}>
          {/* Červená kulička - posunuta doleva a nahoru */}
          <div 
            className={`absolute ${ballSize}`}
            style={{ 
              transform: `translate(-28px, -19px) ${ballDirections[0] === 'left' ? 'scaleX(-1)' : ''}`,
              zIndex: 2
            }}
          >
            <BallRed />
          </div>
          {/* Modrá kulička - posunuta doleva a nahoru */}
          <div 
            className={`absolute ${ballSize}`}
            style={{ 
              transform: `translate(-12px, -31px) ${ballDirections[1] === 'left' ? 'scaleX(-1)' : ''}`,
              zIndex: 1
            }}
          >
            <BallBlue />
          </div>
        </div>
      ) : isOccupied && ballColor ? (
        // Jedna kulička - s animací oslavy když vyhraje
        isWinnerCelebrating ? (
          <div className="absolute top-[30%] left-[35%]" style={{ transform: 'translate(-50%, calc(-50% - 30px))' }}>
            {/* Poskakující kulička */}
            <motion.div
              className={`${ballSize} relative`}
              style={{ 
                transform: ballDirections[0] === 'left' ? 'scaleX(-1)' : ''
              }}
              animate={{
                y: [0, -60, -40, -70, -30, -60, -20, -50, 0],
                rotate: [0, -15, 15, -10, 10, -5, 5, 0, 0],
                scale: [1, 1.2, 1.1, 1.25, 1.15, 1.2, 1.1, 1.15, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {ballColor === '#FF4444' ? <BallRed /> : <BallBlue />}
            </motion.div>
            
            {/* Třpytivé hvězdičky kolem */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFA500' : '#FFFF00',
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, Math.cos(i * Math.PI / 6) * 50],
                  y: [0, Math.sin(i * Math.PI / 6) * 50],
                  opacity: [0, 1, 0],
                  scale: [0, 1.5, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        ) : (
          <div
            className={`absolute top-[30%] left-[35%] ${ballSize}`}
            style={{ 
              transform: `translate(-50%, calc(-50% - 30px)) ${ballDirections[0] === 'left' ? 'scaleX(-1)' : ''}`
            }}
          >
            {ballColor === '#FF4444' ? <BallRed /> : <BallBlue />}
          </div>
        )
      ) : null}
      
      {/* Srdíčko */}
      {hasHeart && !heartCollected && (
        <motion.div
          className="absolute w-12 h-12 md:w-16 md:h-16"
          style={{ 
            top: 'calc(50% - 65px)',
            left: 'calc(50% - 35px)',
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.15, 1],
            y: [0, -8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        >
          <Group17794 />
        </motion.div>
      )}
      
      {/* Animace sebrání srdíčka */}
      {hasHeart && heartCollected && (
        <motion.div
          className="absolute w-12 h-12 md:w-16 md:h-16 z-30"
          style={{ 
            top: 'calc(50% - 65px)',
            left: 'calc(50% - 35px)',
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 1, opacity: 1, rotate: 0 }}
          animate={{ 
            scale: [1, 2.5, 0],
            opacity: [1, 1, 0],
            rotate: [0, 360],
            y: [0, -80, -120]
          }}
          transition={{
            duration: 0.8,
            ease: "easeOut"
          }}
        >
          <Group17794 />
          
          {/* Třpytivé částice */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.6, repeat: 2 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-pink-400 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, Math.cos(i * Math.PI / 4) * 40],
                  y: [0, Math.sin(i * Math.PI / 4) * 40],
                  opacity: [1, 0],
                  scale: [1, 0]
                }}
                transition={{
                  duration: 0.6,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
      

    </motion.div>
  );
}
