import { action, observable, makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './rootStore';
import { Player } from './socketStore';
import { Result } from '../components/Controller/CtrlEden/Phases/Voting';

export type Phase = 'lounge'|'splash'|'announce_players'|'round_start'|'round_end'|'voting'|'results'|'points'|'ui-update'

export type PromptItem = {
  id: number,
  prompt: string,
  hint?: string
}

export interface IGameStore {
  id: string;
  name?: string;
  description?: string;
  phases?: Phase[];
  currentPhase?: Phase|null;
}

export type GameStateUpdatePayload = {
  gameState: {
    phase: Phase,
    data: PhaseData
  }
}

export type Phase0LoungeData = {

}

export type Phase1SplashData = {
  title: string,
  description: string,
  image: string,
  player_count: number
}

export type Phase2PlayerData = {
  player_indexes: number[]
}

export type Phase3RoundData = {
  pre_delay?: number
  timer: number
  audience: {
    prompt_selection: PromptItem[]
  }
} & PromptItem

export type Phase4RoundData = {

}

export type Phase5VotingData = {
  timer: number
  results: Result[]
}

export type Phase6ResultData = {
  scores: [
    {
      player_index: number,
      image: string,
      votes: number
    }
  ]
}

export type Phase7PointsData = {
  points: [
    {
      player_index: number,
      points: number,
      pointsPrev: number,
      pointsDiff: number,
    }
  ]
}

export type UIUpdateItem = {
  id: string,
  value: string|{x: number, y: number}
}

export type PhaseUIUpdate = {
  controls: UIUpdateItem[]
}

export type PhaseData = Phase0LoungeData | Phase1SplashData | Phase2PlayerData | Phase3RoundData | Phase4RoundData | Phase5VotingData | Phase6ResultData | Phase7PointsData | PhaseUIUpdate

export class GameStore implements IGameStore {
  private rootStore: RootStore;

  @observable id: string = '';
  @observable title: string = '';
  @observable description: string = '';
  @observable phases: Phase[] = [];
  @observable currentPhase: Phase|null = null;
  @observable currentData: PhaseData|null = null;
  @observable userName: string|null = null;
  @observable players: Player[] = [];
  @observable audience: Player[] = [];
  @observable roundData: Phase3RoundData|null = null;
  @observable votingData: Phase5VotingData|null = null;
  @observable resultData: Phase6ResultData|null = null;
  @observable pointsData: Phase7PointsData|null = null;
  @observable uiUpdateData: PhaseUIUpdate|null = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
    this.rootStore = rootStore;
  }

  @action handleUpdate = (data: GameStateUpdatePayload) :void => {
    if (data.gameState.phase === 'ui-update') {
      console.log('ui-update', data.gameState.data)
      this.currentPhase = data.gameState.phase
      this.currentData = data.gameState.data

      this.setUIUpdateData((data.gameState.data as PhaseUIUpdate))
      return
    }

    if (this.currentPhase === data.gameState.phase) {
      console.log('redundant handleUpdate, current phase', this.currentPhase)
      return
    }

    console.log('gameStore - handleUpdate', { data })
    this.currentPhase = data.gameState.phase
    this.currentData = data.gameState.data

    if (this.currentPhase === 'lounge') {
      this.setTitle('')
      this.setDescription('')
      this.setPlayers([])
      this.setAudience([])
      this.setRoundData(null)
      this.setVotingData(null)
      this.setResultData(null)
      this.setPointsData(null)
      return
    }

    if (this.currentPhase === 'splash') {
      const { title, description} = data.gameState.data as Phase1SplashData || {}
      this.setTitle(title)
      this.setDescription(description)
      return
    }

    if (this.currentPhase === 'round_start') {
      this.setVotingData(null)
      this.setResultData(null)
      this.setRoundData(data.gameState.data as Phase3RoundData)
      return
    }

    if (this.currentPhase === 'voting') {
      this.setVotingData(data.gameState.data as Phase5VotingData)
      return
    }

    if (this.currentPhase === 'results') {
      this.setResultData(data.gameState.data as Phase6ResultData)
      return
    }

    if (this.currentPhase === 'points') {
      this.setPointsData(data.gameState.data as Phase7PointsData)
      return
    }
  }

  @action setId = (id: string): void => {
    this.id = id;
  }

  @action setTitle = (title: string): void => {
    this.title = title;
  }

  @action setDescription = (description: string): void => {
    this.description = description;
  }

  @action setPlayers = (players: Player[]): void => {
    this.players = players || [];
  }

  @action setAudience = (audience: Player[]|undefined): void => {
    this.audience = audience || [];
  }

  @action setRoundData = (roundData: Phase3RoundData|null): void => {
    this.roundData = roundData || null;
  }

  @action setVotingData = (votingData: Phase5VotingData|null) : void => {
    this.votingData = votingData || null
  }

  @action setResultData = (resultData: Phase6ResultData|null) : void => {
    this.resultData = resultData || null
  }

  @action setPhases = (phases: Phase[]): void => {
    this.phases = phases || [];
  }

  @action setCurrentPhase = (newPhase: Phase): void => {
    this.currentPhase = newPhase;
  }

  @action setUserName = (name: string|null): void => {
    this.userName = name;
  }

  @action setPointsData = (data: Phase7PointsData|null) : void => {
    this.pointsData = data || null

    runInAction(() => {
      this.setPlayers(this.players.map((player) => {
        return {
          ...player,
          points: data?.points.filter((points) => points.player_index === player.client_index)[0]?.points || 0
        }
      }))
    })
  }

  @action setUIUpdateData = (data: PhaseUIUpdate|null): void => {
    this.uiUpdateData = data || null
  }
}