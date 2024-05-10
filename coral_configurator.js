document.addEventListener("DOMContentLoaded", function() {
    console.log("hello");
    function createSetting(labelText, selectId, options, container) {
        // Create label for the setting
        const label = document.createElement('label');
        label.innerHTML = labelText;
        container.appendChild(label);

        // Create select element for the setting
        const select = document.createElement('select');
        select.id = selectId;
        container.appendChild(select);

        // Populate select element with options
        options.forEach(optionValue => {
            const option = document.createElement('option');
            option.value = optionValue;
            option.textContent = optionValue;
            select.appendChild(option);
        });
    }

    // Get the container where elements will be appended
    const settingsContainer = document.getElementById('settingsContainer');

    // Data for the select elements
    const midiOptions = Array.from({length: 16}, (_, i) => i + 1); // MIDI channels 1-16
    const engineOptions = Array.from({length: 10}, (_, i) => i + 1); // Example engine options

    // Loop through each voice
    for (let i = 0; i < 8; i++) {
         // Create a new div
        const newDiv = document.createElement('div');
        newDiv.setAttribute('class', 'voice-control');

        // Add a bold label for the voice number
        const voiceLabel = document.createElement('label');
        voiceLabel.innerHTML = `<b>Voice ${i+1}</b>`; // <br/>
        newDiv.appendChild(voiceLabel);

        // Creating the MIDI channel setting for each voice
        createSetting('MIDI Ch: ', `voice${i}midi`, midiOptions, newDiv);

        // Creating the engine setting for each voice
        createSetting('  Engine: ', `voice${i}engine`, engineOptions, newDiv);
        
        settingsContainer.appendChild(newDiv);
        // Append a line break for better formatting
        // settingsContainer.appendChild(document.createElement('hr'));
    }
});


function createPatch() {
    return {
        freq_fine: 0.0,
        harmonics: 0.5,
        timbre: 0.5,
        morph: 0.5,
        cutoff: 0.5,
        f_env: 0.1,
        reso: 0.1,
        pan: 0.0,
        noise: 0.0,
        level: 0.5,

        amp_attack: 0.1,
        amp_dec: 0.3,
        filter_attack: 0.1,
        filter_dec: 0.3,
        sustain: 0.2,

        space_send: 0.0,
        chorus_send: 0.0,

        atk_dec_trim: 1.0,
        filter_trim: 1.0,
        harm_trim: 1.0,
        timbre_trim: 1.0,
        morph_trim: 1.0,

        delay_send: 0.0,

        delay_time: 0.5,
        delay_spread: 0.1,
        delay_fbk: 0.3,
        delay_lp: 0.9,
        reverb_size: 0.75,
        reverb_filter: 0.75,

        reserved_float: new Array(9).fill(0.0),

        engine: 4,
        midi_ch: 2,
        octave: 0,
        cv_selected_part_: 0,

        glide: 0,
        glide_mode: 0,

        reserved_byte: new Array(14).fill(0),
    };
}

function serializePatch(patch, view, startOffset) {
    // Write all floats
    const floats = [
        patch.freq_fine, patch.harmonics, patch.timbre, patch.morph,
        patch.cutoff, patch.f_env, patch.reso, patch.pan, patch.noise,
        patch.level, patch.amp_attack, patch.amp_dec, patch.filter_attack,
        patch.filter_dec, patch.sustain, patch.space_send, patch.chorus_send,
        patch.atk_dec_trim, patch.filter_trim, patch.harm_trim,
        patch.timbre_trim, patch.morph_trim, patch.delay_send, patch.delay_time,
        patch.delay_spread, patch.delay_fbk, patch.delay_lp, patch.reverb_size,
        patch.reverb_filter, ...patch.reserved_float
    ];
    floats.forEach((f) => {
        view.setFloat32(startOffset, f, true);
        startOffset += 4;
    });

    // Write bytes
    const bytes = [
        patch.engine, patch.midi_ch, patch.octave, patch.cv_selected_part_,
        patch.glide, patch.glide_mode, ...patch.reserved_byte,
    ];
    bytes.forEach((b) => {
        view.setInt8(startOffset, b);
        startOffset += 1;
    });

    return startOffset;
}

function serializeAndDownload() {
    const select = document.getElementById('PresetSelect');
    const selectedPatchIndex = parseInt(select.value) - 1; // Adjust index (0-based)

    const patchSize = 38 * 4 + 20; // Size of one Patch structure in bytes
    const buffer = new ArrayBuffer(patchSize * 8); // Buffer for 8 patches
    const view = new DataView(buffer);

    let offset = 0;
    const patches = Array.from({length: 8}, createPatch);
    
    for (let index = 0; index < 8; index++) {
        const midi_select = document.getElementById(`voice${index}midi`);
        const midi_ch = parseInt(midi_select.value);
        patches[index].midi_ch = midi_ch - 1;
        const engine_select = document.getElementById(`voice${index}engine`);
        const engine = parseInt(engine_select.value);
        patches[index].engine = engine - 1;

        // console.log("Voice ", index+1, "- MIDI ", midi_ch, "- Engine ", engine );
    }

    patches.forEach(patch => {
        offset = serializePatch(patch, view, offset);
    });

    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const fileUrl = URL.createObjectURL(blob);

    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = `Preset ${selectedPatchIndex + 1}.preset`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

function fillPresetSelection() {
    const select = document.getElementById('PresetSelect');
    for (let i = 1; i <= 10; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.text = `Preset ${i}`;
        select.appendChild(option);
    }
}


window.onload = fillPresetSelection;