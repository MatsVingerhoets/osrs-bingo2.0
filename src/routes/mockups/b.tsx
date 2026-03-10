import { createFileRoute } from '@tanstack/react-router'
import { PlayerHomePrototype } from '#/features/design/player-home-prototype'

export const Route = createFileRoute('/mockups/b')({
  component: MockupBPage,
})

function MockupBPage() {
  return <PlayerHomePrototype />
}
