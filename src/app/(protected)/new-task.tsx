import { CustomButton } from '@/components/custom-button'
import ChevronRight from '@/components/icons/chevron-right'
import WithArrowBack from '@/layout/with-arrow-back'
import { Select } from 'heroui-native'
import { View, Text } from 'react-native'

const NewTask = () => {
  return (
    <WithArrowBack title="New Task">
      <View className="gap-4 mt-10">
        <Select>
          <Select.Trigger className="rounded-xl bg-transparent-day border-0 shadow-none h-12 text-base leading-tight flex-row items-center justify-between p-3">
            <View className="flex-row items-center">
              <Text className="text-base text-text-day">Category</Text>
            </View>

            <View className="flex-row items-center gap-2">
              <Select.Value placeholder="" />
              <ChevronRight />
            </View>

          </Select.Trigger>
          <Select.Portal>
            <Select.Overlay />
            <Select.Content width="full">
              <Select.Item value="1" label="Item 1" />
              <Select.Item value="2" label="Item 2" />
            </Select.Content>
          </Select.Portal>
        </Select>

        <CustomButton>
          Create Task
        </CustomButton>
      </View>
    </WithArrowBack>
  )
}

export default NewTask