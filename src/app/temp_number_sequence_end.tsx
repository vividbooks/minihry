// Konec souboru NumberSequenceGame.tsx
      </div>

      {/* Game Result Screen */}
      {showSuccess && (
        <GameResultScreen
          isSuccess={true}
          displayType="correctAnswer"
          autoHideDuration={2}
          successText="VÝBORNĚ!"
          showContinueButton={false}
          onContinue={() => setShowSuccess(false)}
        />
      )}
    </DndProvider>
  );
}