import { IPlayerForm, IPlayerCard } from '../common/interfaces'
import { toggleModalWindow } from '../store/reducers/globalReducer/globalActions'
import { AppThunk } from '../types/reducers/game-settings'

export const setSession = (idSession?: string): AppThunk => {
  return (dispatch, getState) => {
    
    const closedConnection = (mes: string) => {
      dispatch({ type: 'SHOW_ALERT', payload: mes})
      dispatch({ type: 'SET_LOCATION', payload: '/' })
    }

    if (getState().playerCards.ws)
      getState().playerCards.ws.close(1000, 'New connection...')
    const wsConnection = new WebSocket('ws://localhost:4000')

    wsConnection.onopen = () => {

      dispatch(toggleModalWindow(true))
      if (idSession) {
        wsConnection.send(
          JSON.stringify({ type: 'CHECK_ID_SESSION', idSession })
        )
      } else
        wsConnection.send(JSON.stringify({ type: 'SET_SESSION', idSession }))

      dispatch({ type: 'WS', ws: wsConnection })

      wsConnection.onmessage = function (event) {
        const data = JSON.parse(event.data)
        switch (data.type) {
          case 'SET_PLAYERS':
            dispatch({ type: 'SET_PLAYERS', payload: data.players })
            break
          case 'SET_LOCATION':
            dispatch({ type: 'SET_LOCATION', payload: data.location })
            break
          case 'SET_SETTINGS':
            dispatch({ type: 'SET_SETTINGS', payload: data.settings })
            dispatch({ type: 'SET_ISSUES', payload: data.issues })
            break
          case 'SET_ROUND_START':
            dispatch({ type: 'START_TIMER' })
            // dispatch({ type: 'SET_ISSUES', payload: data.issues })
            break
          case 'SET_ROUND_RESULT':
            console.log('SET_ROUND_RESULT',  data.issue)
            console.log(data.score)
            console.log( data.statistic)
            // dispatch({ type: 'START_TIMER' })
            // dispatch({ type: 'SET_ISSUES', payload: data.issues })
            break
        }
      }

      wsConnection.onclose = function (event) {
        if (event.wasClean) closedConnection('Connection to session closed. Reason: ' + event.reason)
        else closedConnection('Connection to session closed. Reason: Server disconnect...')
      }
    }
    wsConnection.onerror = function (err: Event) {
      const error = err as ErrorEvent
      closedConnection('Error: no connection...'+ error.message)
    }
  }
}

export const sendPlayerForm = (playerForm: IPlayerForm): AppThunk => {
  return (dispatch, getState) => {
    const player: IPlayerCard = {
      name: playerForm.firstName + ' ' + playerForm.lastName,
      position: playerForm.position,
      photo: playerForm.image,
      id: Date.now(),
    }
    dispatch({ type: 'SET_PLAYER_ID', id: player.id })
    getState().playerCards.ws?.send(
      JSON.stringify({ type: 'PUT_PLAYER', player })
    )
    getState().playerCards.ws?.send(
      JSON.stringify({ type: 'SET_LOCATION', location: '/lobby' })
    )
  }
}

export const deletePlayerCard =
  (id: number | undefined): AppThunk =>
  (dispatch, getState) => {
    if (id)
      getState().playerCards.ws?.send(
        JSON.stringify({ type: 'DEL_PLAYER', playerId: id })
      )
  }

export const closeSession =
  (id: number | undefined): AppThunk =>
  (dispatch, getState) => {
    if (id)
      getState().playerCards.ws?.send(
        JSON.stringify({ type: 'CLOSE_SESSION', playerId: id })
      )
}

export const startGame: AppThunk = (dispatch, getState) => {
  const settings = getState().settings;
  const issues = getState().issues.issueCard;
  getState().playerCards.ws?.send(JSON.stringify({ type: 'START_GAME', issues, settings }))
}

export const setRoundStart: AppThunk = (dispatch, getState) => {
  // const issue = getState().issues;  !!!need flag
  const issue = 0;
  getState().playerCards.ws?.send(JSON.stringify({ type: 'SET_ROUND_START', issue }))

}
export const setRoundResult: AppThunk = (dispatch, getState) => {
  const playerId = getState().playerCards.id;
  // const issue = getState().issues;  !!!need flag
  // const card = getState().  !!!need flag
  console.log('setRoundResult')
  const issue = 0;
  const card = getState().game.selectedCardVote.idCard;
  getState().playerCards.ws?.send(JSON.stringify({ type: 'SET_ROUND_RESULT', playerId, issue, card }))
}


