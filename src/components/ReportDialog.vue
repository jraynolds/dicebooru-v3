<template>
	<div class="text-center">
		<v-dialog
			v-model="dialog"
			width="500"
			:persistent="reportSending"
		>
			<template v-slot:activator="{ props }">
				<v-btn
					style="position: absolute; left: 10px; top: 13px;"
					color="red"
					v-bind="props"
					size="25px"
					icon="mdi-exclamation"
				/>
			</template>

			<v-card>
				<v-card-title class="header bg-primary">Report this map</v-card-title>

				<v-form :disabled="reportSending">
					<v-col>
						<v-select 
							:items="dataStore.getReportReasons" 
							v-model="reportType"
							return-object
							item-title="name"
						>
							<template v-slot:item="{ item, props }">
								<v-list-item
									v-bind="props"
									:title="toUpperFirst(item?.raw?.name)"
									:subtitle="sentenced(item?.raw?.description)"
								/>
							</template>
						</v-select>
						
						<v-text-field 
							v-model="reportString" 
							label="Please write a short description of the problem."
							counter
							maxlength="200"
							:rules="[ value => value?.length > 0 || 'Required.', value => value.length <= 200 || 'Too long!', ]"
						/>
					</v-col>

					<v-card-actions>	
						<v-card-text style="fontSize: small;">
							<em>A pattern of improper or abusive reports will lead to your account being restricted or banned.</em>
						</v-card-text>
						
						<v-btn color="error">
							<v-progress-circular v-show="reportSending" indeterminate size="20" color="error" class="mr-1" />
							Report
						</v-btn>
					</v-card-actions>
				</v-form>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { ref } from 'vue';
import { useDataStore } from "@/stores/data.js"

import { toUpperFirst, sentenced } from '@/scripts/extensions.js'

export default {
	methods: {
		makeReport() {
			this.reportSending = true;

			this.reportSending = false;
		}
	},

	setup () {
		const dataStore = useDataStore();

		const dialog = ref(false);
		const reportType = ref(null);
		const reportString = ref("");
		const reportSending = ref(false);

		return {
			toUpperFirst,
			sentenced,

			dataStore,

			dialog,
			reportType,
			reportString,
			reportSending
		}
	},
}
</script>

<style>

</style>