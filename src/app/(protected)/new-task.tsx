import { CustomButton } from '@/components/custom-button'
import WithArrowBack from '@/layout/with-arrow-back'
import { View, Text } from 'react-native'

const NewTask = () => {
  return (
    <WithArrowBack title="New Task">
      <View>
        <Text>New Task</Text>
      </View>
      <CustomButton>
        Create Task
      </CustomButton>
    </WithArrowBack>
  )
}

export default NewTask