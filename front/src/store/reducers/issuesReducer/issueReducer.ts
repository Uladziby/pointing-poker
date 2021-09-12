import { ActionIssues, DELETE_ISSUE } from './../../actions'
import { CREATE_NEW_ISSUE } from '../../actions'
import { CustomIssueInterface, IIssues } from './../../../common/interfaces'

export const arrOfIssues: CustomIssueInterface[] = [
  {
    title: 'issue 14',
    link: 'https://react-hook-form.com/api/useform',
    priority: 'Medium',
  },
  {
    title: 'issue 06',
    link: 'https://react-hook-form.com/api/useform',
    priority: 'High',
  },
]

const initialStateIssues: IIssues = {
  issueCard: arrOfIssues,
}

export const ChangeIssuesReducer = (
  state: IIssues = initialStateIssues,
  action: ActionIssues
) => {
  switch (action.type) {
    case CREATE_NEW_ISSUE: {
      return { ...state, issueCard: [...state.issueCard, action.payload] }
    }
    case DELETE_ISSUE: {
      return {
        ...state,
        issueCard: state.issueCard.filter(
          (item) => item.title !== action.payload
        ),
      }
    }
    default:
      return state
  }
}
