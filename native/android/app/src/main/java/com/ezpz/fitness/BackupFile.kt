package com.ezpz.fitness

import java.io.InputStream
import java.io.OutputStream
import java.io.IOException

/** Success means the closed document can be read back byte-for-byte. */
object BackupFile {
    fun read(input: () -> InputStream?, maxBytes: Int): ByteArray {
        require(maxBytes > 0)
        val bytes = (input() ?: throw IOException("Could not open this file. Your app data was kept.")).use { stream ->
            val output = java.io.ByteArrayOutputStream()
            val buffer = ByteArray(8192)
            while (true) {
                val count = stream.read(buffer)
                if (count == -1) break
                if (output.size() + count > maxBytes) throw IOException("This file is too large. Your app data was kept.")
                output.write(buffer, 0, count)
            }
            output.toByteArray()
        }
        if (bytes.isEmpty()) throw IOException("This file is empty (0 bytes). Export a new copy. Your app data was kept.")
        return bytes
    }
    fun save(bytes: ByteArray, output: () -> OutputStream?, input: () -> InputStream?): Int {
        if (bytes.isEmpty()) throw IOException("Cannot save an empty backup")
        (output() ?: throw IOException("Could not open the backup destination")).use {
            it.write(bytes)
            it.flush()
        }
        val actual = read(input, bytes.size)
        if (!actual.contentEquals(bytes)) throw IOException("Backup file verification failed")
        return bytes.size
    }
}
