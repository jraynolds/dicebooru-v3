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

				<v-form v-model="isReportable" :disabled="reportSending">
					<v-col>
						<v-select 
							:items="reportReasons" 
							v-model="reportType"
							return-object
							item-title="name"
						>
							<template v-slot:selection="{ item, props }">
								{{ toUpperFirst(item.raw.name) }}
							</template>
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
							:rules="[ 
								value => value?.length > 0 || 'Required.', 
								value => value.length <= 200 || 'Too long!' 
							]"
						/>
					</v-col>

					<v-card-actions>	
						<v-card-text style="fontSize: small;">
							<em>A pattern of improper or abusive reports will lead to your account being restricted or banned.</em>
						</v-card-text>
						
						<v-btn 
							color="error" 
							:disabled="!isReportable" 
							@click="makeReport()"
						>
							<v-progress-circular 
								v-show="reportSending" 
								indeterminate 
								size="20" 
								color="error" 
								class="mr-1" 
							/>
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
import { useVisualsStore } from "@/stores/visuals.js"

import { toUpperFirst, sentenced } from '@/scripts/extensions.js'
import SnackBar from '@/components/framework/SnackBar.vue';

export default {
	props: ["map"],

	components: { SnackBar },

	computed: {
		reportReasons() {
			this.reportType = this.dataStore.getReportReasons[0];
			return this.dataStore.getReportReasons;
		}
	},

	methods: {
		async makeReport() {
			this.reportSending = true;
			const { error } = await this.dataStore.uploadReport(
				this.reportType.id, 
				this.reportString, 
				this.map.id
			);
			this.reportSending = false;
			if (error) this.visualsStore.showSnackbar("Unknown reporting error. Please try again later.");
			else {
				this.dialog = false;
				this.$emit("submitted");
			}
		}
	},

	setup() {
		const dataStore = useDataStore();
		const visualsStore = useVisualsStore();

		const dialog = ref(false);
		const reportType = ref(null);
		const reportString = ref("");
		const reportSending = ref(false);
		const errorDialog = ref(false);
		const isReportable = ref(false);

		return {
			toUpperFirst,
			sentenced,
			dataStore,
			visualsStore,

			dialog,
			reportType,
			reportString,
			reportSending,
			errorDialog,
			isReportable
		};

	},
}
</script>

<style>

</style>